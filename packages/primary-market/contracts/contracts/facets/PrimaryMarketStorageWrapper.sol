// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PRIMARY_MARKET_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PrimaryMarketStorageWrapper
 * @notice Storage layout for Primary Market facet using diamond storage pattern
 * @dev Uses EIP-2535 Diamond Storage pattern to avoid storage collisions
 */
abstract contract PrimaryMarketStorageWrapper {
    /// @notice Detailed information about a subscription
    struct Subscription {
        address investor; // Address of the investor
        uint256 lotUnits; // Number of lot units subscribed
        bool exists; // Flag to check if subscription exists
        bool cancelled; // Flag to mark if subscription was cancelled
    }

    /**
     * @notice Complete state of an offering including lifecycle flags and tracking
     * @dev Lifecycle is tracked with two boolean flags: executed and cancelled
     */
    struct OfferingState {
        IPrimaryMarket.Offering info;     // Basic offering information
        address creator;                   // Address that created the offering
        bool executed;                     // Lifecycle flag: offering was executed
        bool cancelled;                    // Lifecycle flag: offering was cancelled
        uint256 totalSubscribed;           // Total token amount subscribed so far
        uint256[] subscriptionIds;         // Array of subscription IDs for iteration
        mapping(uint256 => Subscription) subscriptions; // subscriptionId => Subscription
        uint256 nextSubscriptionId;        // Counter for subscription IDs
    }

    /// @notice Main storage structure
    struct PrimaryMarketStorage {
        mapping(uint256 => OfferingState) offerings; // offeringId => OfferingState
        uint256[] offeringIds; // Array of offering IDs for iteration
        uint256 nextOfferingId; // Counter for offering IDs
    }

    /**
     * @notice Returns the storage
     * @return primaryMarketStorage Primary market storage
     */
    function _primaryMarketStorage()
        internal
        pure
        returns (PrimaryMarketStorage storage primaryMarketStorage)
    {
        bytes32 position = PRIMARY_MARKET_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            primaryMarketStorage.slot := position
        }
    }

    /**
     * @notice Internal implementation for creating an offering
     * @param _offeringInfo Details of the offering to create
     * @dev Initializes offering with executed=false and cancelled=false
     */
    function _createOffering(IPrimaryMarket.Offering calldata _offeringInfo) internal {
        PrimaryMarketStorage storage s = _primaryMarketStorage();

        uint256 offeringId = s.nextOfferingId++;
        s.offeringIds.push(offeringId);

        OfferingState storage offering = s.offerings[offeringId];
        offering.info = _offeringInfo;
        offering.creator = msg.sender;
        // executed and cancelled default to false
        offering.totalSubscribed = 0;
        offering.nextSubscriptionId = 0;

        // Associate payment token with this contract (Hedera token association)
        // This is a no-op on EVM chains but required on Hedera
        _associateToken(_offeringInfo.paymentToken);

        emit IPrimaryMarket.OfferingCreated(offeringId, msg.sender, _offeringInfo);
    }

    /**
     * @notice Internal implementation for submitting a subscription
     * @param _offeringId The offering ID
     * @param _lotUnits Number of lots to subscribe
     * @dev Validates offering is active and within subscription period
     */
    function _submitSubscription(uint256 _offeringId, uint256 _lotUnits) internal {
        PrimaryMarketStorage storage s = _primaryMarketStorage();
        OfferingState storage offering = s.offerings[_offeringId];

        // Offering must not be executed or cancelled
        if (offering.executed || offering.cancelled) {
            revert IPrimaryMarket.SubscriptionNotAcceptedForOffering(_offeringId);
        }

        // Must be within offering period (startDate <= now <= endDate)
        if (block.timestamp < offering.info.startDate || block.timestamp > offering.info.endDate) {
            revert IPrimaryMarket.SubscriptionNotAcceptedForOffering(_offeringId);
        }

        // Calculate target amount for validation checks
        uint256 targetAmount = offering.info.targetLots * offering.info.lotSize;

        // If CLOSE_TARGET_REACHED rule, check if target already reached
        if (offering.info.deadlineRule == IPrimaryMarket.DeadlineRule.CLOSE_TARGET_REACHED
            && offering.totalSubscribed >= targetAmount) {
            revert IPrimaryMarket.SubscriptionNotAcceptedForOffering(_offeringId);
        }

        // Check investor is compliant with asset restrictions
        if (!_isCompliantInvestor(msg.sender, offering.info.asset)) {
            revert IPrimaryMarket.NotCompliantAccount(msg.sender, offering.info.asset);
        }

        // Validate lot unit constraints (must be within minLots and maxLots)
        if (_lotUnits < offering.info.minLots || _lotUnits > offering.info.maxLots) {
            revert IPrimaryMarket.WrongQuantities(offering.info.lotSize, offering.info.minLots, offering.info.maxLots, offering.info.targetLots);
        }

        // Calculate subscription amount in tokens
        uint256 subscriptionAmount = _lotUnits * offering.info.lotSize;

        // Check if oversubscription is allowed
        uint256 newTotal = offering.totalSubscribed + subscriptionAmount;
        if (
            offering.info.targetQuantityRule == IPrimaryMarket.TargetQuantityRule.OVERSUBSCRIPTION_NOT_ALLOWED &&
            newTotal > targetAmount
        ) {
            revert IPrimaryMarket.WrongQuantities(offering.info.lotSize, offering.info.minLots, offering.info.maxLots, offering.info.targetLots);
        }

        // Calculate required payment (assuming 1:1 ratio for simplicity, can be enhanced)
        uint256 requiredPayment = subscriptionAmount; // TODO: Add price calculation logic
        IERC20 paymentToken = IERC20(offering.info.paymentToken);

        // Check investor has approved enough tokens
        uint256 allowance = paymentToken.allowance(msg.sender, address(this));
        if (allowance < requiredPayment) {
            revert IPrimaryMarket.NotEnoughFunds(msg.sender, requiredPayment, allowance, offering.info.paymentToken);
        }

        // Transfer payment tokens from investor to this contract
        bool success = paymentToken.transferFrom(msg.sender, address(this), requiredPayment);
        if (!success) {
            revert IPrimaryMarket.NotEnoughFunds(msg.sender, requiredPayment, 0, offering.info.paymentToken);
        }

        // Create subscription
        uint256 subscriptionId = offering.nextSubscriptionId++;
        offering.subscriptionIds.push(subscriptionId);
        offering.subscriptions[subscriptionId] = Subscription({
            investor: msg.sender,
            lotUnits: _lotUnits,
            exists: true,
            cancelled: false
        });

        // Update total subscribed
        offering.totalSubscribed = newTotal;

        // Note: When target is reached with CLOSE_TARGET_REACHED rule,
        // subsequent subscription attempts will be rejected by the validation above

        emit IPrimaryMarket.SubscriptionSubmitted(_offeringId, subscriptionId, msg.sender, _lotUnits);
    }

    /**
     * @notice Internal implementation for getting total offerings
     * @return total_ Total offerings created
     */
    function _getTotalOfferings() internal view returns (uint256 total_) {
        return _primaryMarketStorage().nextOfferingId;
    }

    /**
     * @notice Internal implementation for getting offering IDs with pagination
     * @param _pageIndex Page index (0-based)
     * @param _pageLength Number of IDs per page
     * @return ids Array of offering IDs
     */
    function _getOfferingIds(uint256 _pageIndex, uint256 _pageLength) internal view returns (uint256[] memory ids) {
        PrimaryMarketStorage storage s = _primaryMarketStorage();
        uint256 start = _pageIndex * _pageLength;
        uint256 end = start + _pageLength;

        if (end > s.offeringIds.length) {
            end = s.offeringIds.length;
        }

        if (start >= s.offeringIds.length) {
            return new uint256[](0);
        }

        ids = new uint256[](end - start);
        for (uint256 i = start; i < end; i++) {
            ids[i - start] = s.offeringIds[i];
        }
    }

    /**
     * @notice Internal implementation for getting offering details
     * @param _offeringId Offering ID
     * @return offeringInfo_ Offering information
     * @return offeringOperator_ Address that created the offering
     */
    function _getOffering(
        uint256 _offeringId
    ) internal view returns (IPrimaryMarket.Offering memory offeringInfo_, address offeringOperator_) {
        OfferingState storage offering = _primaryMarketStorage().offerings[_offeringId];
        return (offering.info, offering.creator);
    }

    /**
     * @notice Internal implementation for getting total subscriptions
     * @param _offeringId Offering ID
     * @return total_ Total subscriptions
     */
    function _getTotalSubscriptions(uint256 _offeringId) internal view returns (uint256 total_) {
        return _primaryMarketStorage().offerings[_offeringId].nextSubscriptionId;
    }

    /**
     * @notice Internal implementation for getting subscription IDs with pagination
     * @param _offeringId Offering ID
     * @param _pageIndex Page index (0-based)
     * @param _pageLength Number of IDs per page
     * @return ids Array of subscription IDs
     */
    function _getSubscriptionIds(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory ids) {
        OfferingState storage offering = _primaryMarketStorage().offerings[_offeringId];
        uint256 start = _pageIndex * _pageLength;
        uint256 end = start + _pageLength;

        if (end > offering.subscriptionIds.length) {
            end = offering.subscriptionIds.length;
        }

        if (start >= offering.subscriptionIds.length) {
            return new uint256[](0);
        }

        ids = new uint256[](end - start);
        for (uint256 i = start; i < end; i++) {
            ids[i - start] = offering.subscriptionIds[i];
        }
    }

    /**
     * @notice Internal implementation for getting subscription details
     * @param _offeringId Offering ID
     * @param _subscriptionId Subscription ID
     * @return investor_ Investor address
     * @return lotUnits_ Number of lot units
     */
    function _getSubscription(
        uint256 _offeringId,
        uint256 _subscriptionId
    ) internal view returns (address investor_, uint256 lotUnits_) {
        Subscription storage sub = _primaryMarketStorage().offerings[_offeringId].subscriptions[_subscriptionId];

        if (!sub.exists) {
            revert IPrimaryMarket.OfferingDoesNotExist(_subscriptionId); // Reusing error for subscription not found
        }

        return (sub.investor, sub.lotUnits);
    }

    /**
     * @notice Internal placeholder for executing an offering
     * @param _offeringId Offering ID
     * @dev TODO: When implemented, this function should:
     *      1. Verify offering.executed == false and offering.cancelled == false
     *      2. Verify block.timestamp > endDate (offering period ended)
     *      3. Process all subscriptions (transfer assets to investors)
     *      4. Transfer payment tokens to treasury
     *      5. Set offering.executed = true at the end
     */
    function _executeOffering(uint256 _offeringId, uint256, uint256) internal pure {
        revert IPrimaryMarket.OfferingCannotBeExecuted(_offeringId);
    }

    /**
     * @notice Internal placeholder for cancelling an offering
     * @param _offeringId Offering ID
     * @dev TODO: When implemented, this function should:
     *      1. Verify offering.executed == false and offering.cancelled == false
     *      2. Refund all payment tokens to investors
     *      3. Set offering.cancelled = true at the end
     */
    function _cancelOffering(uint256 _offeringId, uint256, uint256) internal pure {
        revert IPrimaryMarket.OfferingCannotBeCancelled(_offeringId);
    }

    /**
     * @notice Internal placeholder for cancelling a subscription
     * @param _offeringId Offering ID
     * @dev TODO: When implemented, should refund investor and mark subscription.cancelled = true
     */
    function _cancelSubscription(uint256 _offeringId, uint256) internal pure {
        revert IPrimaryMarket.SubscriptionNotAcceptedForOffering(_offeringId);
    }

    /**
     * @notice Check if investor is compliant with asset restrictions
     * @param _investor Investor address
     * @param _asset Asset address
     * @return bool True if compliant
     * @dev TODO: Implement proper compliance checking with T-REX identity registry
     *      This requires calling the asset's identityRegistry and checking investor verification
     */
    function _isCompliantInvestor(address _investor, address _asset) internal pure returns (bool) {
        // Simplified implementation - always returns true
        // Full implementation should check T-REX IdentityRegistry for investor verification
        _investor; // Silence unused variable warning
        _asset; // Silence unused variable warning
        return true;
    }

    /**
     * @notice Associate token with contract (for Hedera compatibility)
     * @param _token Token address to associate
     * @dev This is a no-op on EVM chains
     */
    function _associateToken(address _token) internal pure {
        // On Hedera, this would call the token association system contract
        // On EVM chains, this is a no-op
        // Implementation depends on deployment target
        _token; // Silence unused variable warning
    }
}
