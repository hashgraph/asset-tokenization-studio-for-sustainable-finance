// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PrimaryMarketStorageWrapper } from "./PrimaryMarketStorageWrapper.sol";
import { OFFERING_CREATOR_ROLE } from "../constants/roles.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PrimaryMarket
 * @notice Core implementation of Primary Market functionality for managing offerings and subscriptions
 * @dev Abstract contract implementing IPrimaryMarket interface
 */
abstract contract PrimaryMarket is IPrimaryMarket, PrimaryMarketStorageWrapper, AtsCommon {

    /**
     * @notice Validates offering parameters
     * @param _offeringInfo Offering information to validate
     */
    modifier validateOfferingParams(Offering calldata _offeringInfo) {
        // Validate asset address
        if (_offeringInfo.asset == address(0)) {
            revert WrongAsset(_offeringInfo.asset);
        }

        // Validate treasury address
        if (_offeringInfo.treasury == address(0)) {
            revert WrongTreasury(_offeringInfo.treasury);
        }

        // Validate payment token address
        if (_offeringInfo.paymentToken == address(0)) {
            revert WrongPaymentToken(_offeringInfo.paymentToken);
        }

        // Validate quantities
        if (
            _offeringInfo.lotSize == 0 ||
            _offeringInfo.minQuantity == 0 ||
            _offeringInfo.maxQuantity == 0 ||
            _offeringInfo.targetQuantity == 0 ||
            _offeringInfo.minQuantity > _offeringInfo.maxQuantity ||
            _offeringInfo.maxQuantity > _offeringInfo.targetQuantity ||
            _offeringInfo.minQuantity % _offeringInfo.lotSize != 0 ||
            _offeringInfo.maxQuantity % _offeringInfo.lotSize != 0 ||
            _offeringInfo.targetQuantity % _offeringInfo.lotSize != 0
        ) {
            revert WrongQuantities(
                _offeringInfo.lotSize,
                _offeringInfo.minQuantity,
                _offeringInfo.maxQuantity,
                _offeringInfo.targetQuantity
            );
        }

        // Validate dates
        if (_offeringInfo.startDate >= _offeringInfo.endDate || _offeringInfo.startDate < block.timestamp) {
            revert WrongDates(_offeringInfo.startDate, _offeringInfo.endDate);
        }

        _;
    }

    /**
     * @notice Validates offering exists and is in expected status
     * @param _offeringId Offering ID to check
     */
    modifier offeringExists(uint256 _offeringId) {
        if (_offeringId >= _primaryMarketStorage().nextOfferingId) {
            revert OfferingDoesNotExist(_offeringId);
        }
        _;
    }

    /**
     * @notice Create a new offering
     * @param _offeringInfo Details of the offering to create
     * @dev Only accounts with OFFERING_CREATOR_ROLE can call this function
     */
    function createOffering(
        Offering calldata _offeringInfo
    ) external override onlyUnpaused onlyRole(OFFERING_CREATOR_ROLE) validateOfferingParams(_offeringInfo) {
        PrimaryMarketStorage storage s = _primaryMarketStorage();

        uint256 offeringId = s.nextOfferingId++;
        s.offeringIds.push(offeringId);

        OfferingState storage offering = s.offerings[offeringId];
        offering.info = _offeringInfo;
        offering.creator = msg.sender;
        offering.status = OfferingStatus.CREATED;
        offering.totalSubscribed = 0;
        offering.nextSubscriptionId = 0;

        // Associate payment token with this contract (Hedera token association)
        // This is a no-op on EVM chains but required on Hedera
        _associateToken(_offeringInfo.paymentToken);

        emit OfferingCreated(offeringId, msg.sender, _offeringInfo);
    }

    /**
     * @notice Submit a subscription to an offering
     * @param _offeringId The offering ID
     * @param _lotUnits Number of lot units to subscribe
     */
    function submitSubscription(uint256 _offeringId, uint256 _lotUnits) external override onlyUnpaused offeringExists(_offeringId) {
        PrimaryMarketStorage storage s = _primaryMarketStorage();
        OfferingState storage offering = s.offerings[_offeringId];

        // Check offering is open for subscriptions
        if (offering.status != OfferingStatus.OPEN && offering.status != OfferingStatus.CREATED) {
            revert SubscriptionNotAcceptedForOffering(_offeringId);
        }

        // Auto-open offering if it's in CREATED status and start date has passed
        if (offering.status == OfferingStatus.CREATED && block.timestamp >= offering.info.startDate) {
            offering.status = OfferingStatus.OPEN;
        }

        // Check we haven't passed the end date
        if (block.timestamp > offering.info.endDate) {
            revert SubscriptionNotAcceptedForOffering(_offeringId);
        }

        // Check investor is compliant with asset restrictions
        if (!_isCompliantInvestor(msg.sender, offering.info.asset)) {
            revert NotCompliantAccount(msg.sender, offering.info.asset);
        }

        // Calculate subscription amount
        uint256 subscriptionAmount = _lotUnits * offering.info.lotSize;

        // Validate quantity constraints
        if (subscriptionAmount < offering.info.minQuantity || subscriptionAmount > offering.info.maxQuantity) {
            revert WrongQuantities(offering.info.lotSize, offering.info.minQuantity, offering.info.maxQuantity, offering.info.targetQuantity);
        }

        // Check if oversubscription is allowed
        uint256 newTotal = offering.totalSubscribed + subscriptionAmount;
        if (
            offering.info.targetQuantityRule == TargetQuantityRule.OVERSUBSCRIPTION_NOT_ALLOWED &&
            newTotal > offering.info.targetQuantity
        ) {
            revert WrongQuantities(offering.info.lotSize, offering.info.minQuantity, offering.info.maxQuantity, offering.info.targetQuantity);
        }

        // Calculate required payment (assuming 1:1 ratio for simplicity, can be enhanced)
        uint256 requiredPayment = subscriptionAmount; // TODO: Add price calculation logic
        IERC20 paymentToken = IERC20(offering.info.paymentToken);

        // Check investor has approved enough tokens
        uint256 allowance = paymentToken.allowance(msg.sender, address(this));
        if (allowance < requiredPayment) {
            revert NotEnoughFunds(msg.sender, requiredPayment, allowance, offering.info.paymentToken);
        }

        // Transfer payment tokens from investor to this contract
        bool success = paymentToken.transferFrom(msg.sender, address(this), requiredPayment);
        if (!success) {
            revert NotEnoughFunds(msg.sender, requiredPayment, 0, offering.info.paymentToken);
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

        // Auto-close if target reached and deadline rule is CLOSE_TARGET_REACHED
        if (
            offering.info.deadlineRule == DeadlineRule.CLOSE_TARGET_REACHED &&
            newTotal >= offering.info.targetQuantity
        ) {
            offering.status = OfferingStatus.CLOSED;
        }

        emit SubscriptionSubmitted(_offeringId, subscriptionId, msg.sender, _lotUnits);
    }

    /**
     * @notice Get total number of offerings
     * @return total_ Total offerings created
     */
    function getTotalOfferings() external view override returns (uint256 total_) {
        return _primaryMarketStorage().nextOfferingId;
    }

    /**
     * @notice Get offering IDs with pagination
     * @param _pageIndex Page index (0-based)
     * @param _pageLength Number of IDs per page
     * @return ids Array of offering IDs
     */
    function getOfferingIds(uint256 _pageIndex, uint256 _pageLength) external view override returns (uint256[] memory ids) {
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
     * @notice Get offering details
     * @param _offeringId Offering ID
     * @return offeringInfo_ Offering information
     * @return offeringOperator_ Address that created the offering
     */
    function getOffering(
        uint256 _offeringId
    ) external view override offeringExists(_offeringId) returns (Offering memory offeringInfo_, address offeringOperator_) {
        OfferingState storage offering = _primaryMarketStorage().offerings[_offeringId];
        return (offering.info, offering.creator);
    }

    /**
     * @notice Get total subscriptions for an offering
     * @param _offeringId Offering ID
     * @return total_ Total subscriptions
     */
    function getTotalSubscriptions(uint256 _offeringId) external view override offeringExists(_offeringId) returns (uint256 total_) {
        return _primaryMarketStorage().offerings[_offeringId].nextSubscriptionId;
    }

    /**
     * @notice Get subscription IDs for an offering with pagination
     * @param _offeringId Offering ID
     * @param _pageIndex Page index (0-based)
     * @param _pageLength Number of IDs per page
     * @return ids Array of subscription IDs
     */
    function getSubscriptionIds(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override offeringExists(_offeringId) returns (uint256[] memory ids) {
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
     * @notice Get subscription details
     * @param _offeringId Offering ID
     * @param _subscriptionId Subscription ID
     * @return investor_ Investor address
     * @return lotUnits_ Number of lot units
     */
    function getSubscription(
        uint256 _offeringId,
        uint256 _subscriptionId
    ) external view override offeringExists(_offeringId) returns (address investor_, uint256 lotUnits_) {
        Subscription storage sub = _primaryMarketStorage().offerings[_offeringId].subscriptions[_subscriptionId];

        if (!sub.exists) {
            revert OfferingDoesNotExist(_subscriptionId); // Reusing error for subscription not found
        }

        return (sub.investor, sub.lotUnits);
    }

    // Placeholder implementations for execute and cancel (to be implemented in Phase 2)
    function executeOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external override {
        revert OfferingCannotBeExecuted(_offeringId);
    }

    function cancelOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external override {
        revert OfferingCannotBeCancelled(_offeringId);
    }

    function cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) external override {
        revert SubscriptionNotAcceptedForOffering(_offeringId);
    }

    /**
     * @notice Check if investor is compliant with asset restrictions
     * @param _investor Investor address
     * @param _asset Asset address
     * @return bool True if compliant
     * @dev TODO: Implement proper compliance checking with T-REX identity registry
     *      This requires calling the asset's identityRegistry and checking investor verification
     */
    function _isCompliantInvestor(address _investor, address _asset) internal view returns (bool) {
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
    function _associateToken(address _token) internal {
        // On Hedera, this would call the token association system contract
        // On EVM chains, this is a no-op
        // Implementation depends on deployment target
        _token; // Silence unused variable warning
    }
}
