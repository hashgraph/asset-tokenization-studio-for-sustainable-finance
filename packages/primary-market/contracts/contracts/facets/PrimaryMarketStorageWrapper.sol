// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PRIMARY_MARKET_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";
import { IERC1594 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC1594.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
import { LibCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_0/common/libraries/LibCommon.sol";
import {
    HederaTokenService,
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

/**
 * @title PrimaryMarketStorageWrapper
 * @notice Storage layout for Primary Market facet using diamond storage pattern
 * @dev Uses EIP-2535 Diamond Storage pattern to avoid storage collisions
 */
abstract contract PrimaryMarketStorageWrapper is AtsCommon, HederaTokenService {
    // only for insternal use
    enum CountIndex {
        FAILED,
        SUCCEEDED,
        ALREADY_PROCESSED,
        SUBSCRIPTION_ID_INDEX,
        TRANSFER_INDEX
    }

    uint256 constant COUNT_INDEX_SIZE = 5;

    struct TransferItem {
        int64 amount;
        address destination;
    }

    struct ProcessOfferingInfo {
        uint256 offeringId;
        uint256[] subscriptionIdsToProcess;
        bool isExecution;
        uint256 nominalValue;
    }

    /// @notice Detailed information about a subscription
    struct Subscription {
        address investor; // Address of the investor
        uint256 lotUnits; // Number of lot units subscribed
        bool cancelled; // Flag to mark if subscription was cancelled
        bool executed; // Flag to mark if subscription was executed
    }

    /**
     * @notice Complete state of an offering including lifecycle flags and tracking
     * @dev Lifecycle is tracked with two boolean flags: executed and cancelled
     */
    struct OfferingState {
        IPrimaryMarket.Offering info; // Basic offering information
        address creator; // Address that created the offering
        uint256 totalSubscribedLots; // Total lot units subscribed so far (not tokens)
        uint256 pendingSubscribedLots; // Lot units pending execution/cancellation
        mapping(uint256 => Subscription) subscriptions; // subscriptionId => Subscription
        uint256 nextSubscriptionId; // Counter for subscription IDs (IDs are sequential: 1, 2, 3, ...)
    }

    /// @notice Main storage structure
    struct PrimaryMarketStorage {
        mapping(uint256 => OfferingState) offerings; // offeringId => OfferingState
        uint256 nextOfferingId; // Counter for offering IDs (IDs are sequential: 1, 2, 3, ...)
    }

    /**
     * @notice Internal implementation for creating an offering
     * @param _offeringInfo Details of the offering to create
     * @dev Initializes offering with executed=false and cancelled=false
     */
    function _createOffering(IPrimaryMarket.Offering calldata _offeringInfo) internal {
        PrimaryMarketStorage storage s = _primaryMarketStorage();

        uint256 offeringId = ++s.nextOfferingId;

        OfferingState storage offering = s.offerings[offeringId];
        offering.info = _offeringInfo;
        offering.creator = _msgSender();
        // executed and cancelled default to false
        offering.totalSubscribedLots = 0;
        offering.pendingSubscribedLots = 0;
        offering.nextSubscriptionId = 0;

        // Associate payment token with this contract (Hedera token association)
        // This is a no-op on EVM chains but required on Hedera
        _associateToken(_offeringInfo.paymentToken);

        emit IPrimaryMarket.OfferingCreated(offeringId, _msgSender(), _offeringInfo);
    }

    /**
     * @notice Internal implementation for submitting a subscription
     * @param _offeringId The offering ID
     * @param _lotUnits Number of lots to subscribe
     * @dev All validations are handled by modifiers in the public function
     */
    function _submitSubscription(uint256 _offeringId, uint256 _lotUnits) internal {
        OfferingState storage offering = _getOfferingState(_offeringId);

        // Calculate required payment: lotUnits * lotSize (tokens) * nominalValue (price per token)
        uint256 requiredPayment = _lotUnits *
            offering.info.lotSize *
            IBondRead(offering.info.asset).getBondDetails().nominalValue;

        // Check investor has approved enough payment tokens
        if (IERC20(offering.info.paymentToken).allowance(_msgSender(), address(this)) < requiredPayment) {
            revert IPrimaryMarket.NotEnoughFunds(
                _msgSender(),
                requiredPayment,
                IERC20(offering.info.paymentToken).allowance(_msgSender(), address(this)),
                offering.info.paymentToken
            );
        }

        // Transfer payment tokens from investor to this contract
        if (!IERC20(offering.info.paymentToken).transferFrom(_msgSender(), address(this), requiredPayment)) {
            revert IPrimaryMarket.NotEnoughFunds(_msgSender(), requiredPayment, 0, offering.info.paymentToken);
        }

        // Create subscription
        uint256 subscriptionId = ++offering.nextSubscriptionId;
        offering.subscriptions[subscriptionId] = Subscription({
            investor: _msgSender(),
            lotUnits: _lotUnits,
            cancelled: false,
            executed: false
        });

        // Update total subscribed lots
        offering.totalSubscribedLots += _lotUnits;
        offering.pendingSubscribedLots += _lotUnits;

        emit IPrimaryMarket.SubscriptionSubmitted(_offeringId, subscriptionId, _msgSender(), _lotUnits);
    }

    /**
     * @notice Internal placeholder for cancelling a subscription
     * @param _offeringId Offering ID
     * @dev TODO: When implemented, should refund investor and mark subscription.cancelled = true
     */
    function _cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) internal {
        OfferingState storage offering = _getOfferingState(_offeringId);
        Subscription storage subscription = offering.subscriptions[_subscriptionId];

        if (subscription.cancelled) return;

        uint256 amount = subscription.lotUnits *
            offering.info.lotSize *
            IBondRead(offering.info.asset).getBondDetails().nominalValue;

        subscription.cancelled = true;

        offering.pendingSubscribedLots -= subscription.lotUnits;

        bool success = IERC20(offering.info.paymentToken).transfer(subscription.investor, amount);

        if (!success) revert IPrimaryMarket.SubscriptionCannotBeCancelled(_offeringId, _subscriptionId);
    }

    function _executeOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (IPrimaryMarket.OfferingProcessResult memory executionResult) {
        return _executeOfferingBySubscriptionIds(_offeringId, _extractIds(_pageIndex, _pageLength));
    }

    function _executeOfferingBySubscriptionIds(
        uint256 _offeringId,
        uint256[] memory _subscriptionIds
    ) internal returns (IPrimaryMarket.OfferingProcessResult memory executionResult) {
        executionResult = _processOffering(ProcessOfferingInfo(_offeringId, _subscriptionIds, true, 0));
        emit IPrimaryMarket.OfferingExecuted(
            _offeringId,
            _msgSender(),
            executionResult.succeededSubscriptions,
            executionResult.failedSubscriptions,
            executionResult.alreadyProcessedSubscriptions
        );
        return executionResult;
    }

    function _cancelOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (IPrimaryMarket.OfferingProcessResult memory cancelResult) {
        return _cancelOfferingBySubscriptionIds(_offeringId, _extractIds(_pageIndex, _pageLength));
    }

    function _cancelOfferingBySubscriptionIds(
        uint256 _offeringId,
        uint256[] memory _subscriptionIds
    ) internal returns (IPrimaryMarket.OfferingProcessResult memory cancelResult) {
        cancelResult = _processOffering(ProcessOfferingInfo(_offeringId, _subscriptionIds, false, 0));
        emit IPrimaryMarket.OfferingCancelled(
            _offeringId,
            _msgSender(),
            cancelResult.succeededSubscriptions,
            cancelResult.failedSubscriptions,
            cancelResult.alreadyProcessedSubscriptions
        );
        return cancelResult;
    }

    function _processOffering(
        ProcessOfferingInfo memory _processOfferingInfo
    ) internal returns (IPrimaryMarket.OfferingProcessResult memory processResult) {
        processResult.failedSubscriptions = new uint256[](_processOfferingInfo.subscriptionIdsToProcess.length);
        processResult.succeededSubscriptions = new uint256[](_processOfferingInfo.subscriptionIdsToProcess.length);
        processResult.alreadyProcessedSubscriptions = new uint256[](
            _processOfferingInfo.subscriptionIdsToProcess.length
        );
        uint256[] memory subscriptionIds = new uint256[](_processOfferingInfo.subscriptionIdsToProcess.length);
        uint256[] memory indexCounts = new uint256[](COUNT_INDEX_SIZE);

        uint256 transfersLength = _processOfferingInfo.isExecution
            ? 2
            : _processOfferingInfo.subscriptionIdsToProcess.length + 1;

        TransferItem[] memory transferItems = new TransferItem[](transfersLength);
        int64 totalToTransfer;

        OfferingState storage offering = _getOfferingState(_processOfferingInfo.offeringId);

        if (_processOfferingInfo.isExecution) transferItems[0].destination = offering.info.treasury;

        _processOfferingInfo.nominalValue = IBondRead(offering.info.asset).getBondDetails().nominalValue;

        for (uint256 index = 0; index < _processOfferingInfo.subscriptionIdsToProcess.length; index++) {
            _processSubscription(
                offering,
                _processOfferingInfo,
                _processOfferingInfo.subscriptionIdsToProcess[index],
                processResult,
                indexCounts,
                subscriptionIds,
                totalToTransfer,
                transfersLength,
                transferItems
            );
        }

        _payBatch(
            offering,
            _processOfferingInfo,
            offering.info.paymentToken,
            transferItems,
            totalToTransfer,
            subscriptionIds,
            processResult,
            indexCounts
        );
    }

    function _processSubscription(
        OfferingState storage offering,
        ProcessOfferingInfo memory _processOfferingInfo,
        uint256 subscriptionId,
        IPrimaryMarket.OfferingProcessResult memory processResult,
        uint256[] memory indexCounts,
        uint256[] memory subscriptionIds,
        int64 totalToTransfer,
        uint256 transfersLength,
        TransferItem[] memory transferItems
    ) internal {
        _checkSubscriptionExists(_processOfferingInfo.offeringId, subscriptionId);

        Subscription storage subscription = offering.subscriptions[subscriptionId];

        if (subscription.executed || subscription.cancelled) {
            processResult.alreadyProcessedSubscriptions[
                indexCounts[uint256(CountIndex.ALREADY_PROCESSED)]
            ] = subscriptionId;
            indexCounts[uint256(CountIndex.ALREADY_PROCESSED)]++;
            return;
        }

        uint256 amount = subscription.lotUnits * offering.info.lotSize * _processOfferingInfo.nominalValue;

        if (!_isValidAmount(amount)) {
            processResult.failedSubscriptions[indexCounts[uint256(CountIndex.FAILED)]] = subscriptionId;
            indexCounts[uint256(CountIndex.FAILED)]++;
            return;
        }

        subscriptionIds[indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)]] = subscriptionId;
        indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)]++;

        int64 int64Amount = int64(int256(amount));

        if (!_valueFitsInInt64(uint256(uint64(totalToTransfer)) + amount)) {
            _payBatch(
                offering,
                _processOfferingInfo,
                offering.info.paymentToken,
                transferItems,
                totalToTransfer,
                subscriptionIds,
                processResult,
                indexCounts
            );

            //reset
            totalToTransfer = 0;
            indexCounts[uint256(CountIndex.TRANSFER_INDEX)] = 0;
            transferItems = new TransferItem[](transfersLength);
            subscriptionIds = new uint256[](_processOfferingInfo.subscriptionIdsToProcess.length);
            indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)] = 0;
            if (_processOfferingInfo.isExecution) transferItems[0].destination = offering.info.treasury;
        }

        totalToTransfer += int64Amount;

        if (_processOfferingInfo.isExecution) {
            transferItems[0].amount += int64Amount;
        } else {
            transferItems[indexCounts[uint256(CountIndex.TRANSFER_INDEX)]].amount = int64Amount;
            transferItems[indexCounts[uint256(CountIndex.TRANSFER_INDEX)]].destination = subscription.investor;
            indexCounts[uint256(CountIndex.TRANSFER_INDEX)]++;
        }
    }

    function _payBatch(
        OfferingState storage offering,
        ProcessOfferingInfo memory _processOfferingInfo,
        address paymentToken,
        TransferItem[] memory transferItems,
        int64 totalToTransfer,
        uint256[] memory subscriptionIds,
        IPrimaryMarket.OfferingProcessResult memory processResult,
        uint256[] memory indexCounts
    ) private {
        uint256 nextIndex = _processOfferingInfo.isExecution ? 1 : indexCounts[uint256(CountIndex.TRANSFER_INDEX)];
        transferItems[nextIndex].amount = -totalToTransfer;
        transferItems[nextIndex].destination = address(this);

        int64[] memory amounts = new int64[](nextIndex + 1);
        address[] memory destinations = new address[](nextIndex + 1);

        for (uint256 i = 0; i <= nextIndex; i++) {
            amounts[i] = transferItems[i].amount;
            destinations[i] = transferItems[i].destination;
        }

        if (transferTokens(paymentToken, destinations, amounts) == HederaResponseCodes.SUCCESS) {
            indexCounts[uint256(CountIndex.SUCCEEDED)] = _addToList(
                subscriptionIds,
                processResult.succeededSubscriptions,
                indexCounts[uint256(CountIndex.SUCCEEDED)]
            );
            for (uint256 i = 0; i < subscriptionIds.length; i++) {
                if (_processOfferingInfo.isExecution) {
                    offering.subscriptions[subscriptionIds[i]].executed = true;

                    uint256 amountToMint = offering.subscriptions[subscriptionIds[i]].lotUnits * offering.info.lotSize;

                    IERC1594(offering.info.asset).issue(
                        offering.subscriptions[subscriptionIds[i]].investor,
                        amountToMint,
                        "0x"
                    );
                } else offering.subscriptions[subscriptionIds[i]].cancelled = true;
            }
            offering.pendingSubscribedLots -=
                uint256(uint64(totalToTransfer)) / (offering.info.lotSize * _processOfferingInfo.nominalValue);
            return;
        }
        indexCounts[uint256(CountIndex.FAILED)] = _addToList(
            subscriptionIds,
            processResult.failedSubscriptions,
            indexCounts[uint256(CountIndex.FAILED)]
        );
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

    /**
     * @notice Internal implementation for getting total offerings
     * @return total_ Total offerings created
     */
    function _getTotalOfferings() internal view returns (uint256 total_) {
        return _getNextOfferingId();
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
        OfferingState storage offering = _getOfferingState(_offeringId);
        return (offering.info, offering.creator);
    }

    /**
     * @notice Internal implementation to calculate the current status of an offering
     * @param _offeringId Offering ID
     * @return status_ Current offering status
     * @dev Status is calculated based on:
     *      - Lifecycle flags (executed, cancelled)
     *      - Current timestamp vs startDate/endDate
     *      - Target reached status
     *      - Policy rules (targetQuantityRule, deadlineRule)
     *
     * Policy combinations and their status transitions:
     *
     * 1. OVER_NOT_ALLOWED + WAIT_UNTIL_END:
     *    PENDING → OPEN → CLOSED_TARGET_WAITING (when target reached) → EXECUTABLE → EXECUTED
     *    OR: PENDING → OPEN → CANCELLABLE → CANCELLED (if target not reached after endDate)
     *
     * 2. OVER_NOT_ALLOWED + CLOSE_TARGET_REACHED:
     *    PENDING → OPEN → EXECUTABLE (when target reached, even before endDate) → EXECUTED
     *    OR: PENDING → OPEN → CANCELLABLE → CANCELLED (if target not reached after endDate)
     *
     * 3. OVER_ALLOWED + WAIT_UNTIL_END:
     *    PENDING → OPEN (accepting oversubscriptions) → EXECUTABLE → EXECUTED (after endDate if target reached)
     *    OR: PENDING → OPEN → CANCELLABLE → CANCELLED (if target not reached after endDate)
     */
    function _getOfferingStatus(uint256 _offeringId) internal view returns (IPrimaryMarket.OfferingStatus) {
        OfferingState storage offering = _getOfferingState(_offeringId);

        // Before start date
        if (_blockTimestamp() < offering.info.startDate) {
            return IPrimaryMarket.OfferingStatus.PENDING;
        }

        // Calculate if target is reached (comparing lots directly)
        bool targetReached = offering.totalSubscribedLots >= offering.info.targetLots;

        // After end date
        if (_blockTimestamp() > offering.info.endDate) {
            // All policies: after deadline, check if executable or only cancellable
            if (targetReached) {
                if (offering.pendingSubscribedLots == 0) return IPrimaryMarket.OfferingStatus.EXECUTED;
                return IPrimaryMarket.OfferingStatus.EXECUTABLE;
            } else {
                if (offering.pendingSubscribedLots == 0) return IPrimaryMarket.OfferingStatus.CANCELLED;
                return IPrimaryMarket.OfferingStatus.CANCELLABLE;
            }
        }

        // During offering period (startDate <= now <= endDate)
        if (offering.info.deadlineRule == IPrimaryMarket.DeadlineRule.CLOSE_TARGET_REACHED) {
            // Policy: CLOSE_TARGET_REACHED (only with OVER_NOT_ALLOWED)
            if (targetReached) {
                // Target reached before deadline: can execute immediately
                return IPrimaryMarket.OfferingStatus.EXECUTABLE;
            } else {
                // Still accepting subscriptions
                return IPrimaryMarket.OfferingStatus.OPEN;
            }
        } else {
            // Policy: WAIT_UNTIL_END (with OVER_ALLOWED or OVER_NOT_ALLOWED)
            if (
                targetReached &&
                offering.info.targetQuantityRule == IPrimaryMarket.TargetQuantityRule.OVERSUBSCRIPTION_NOT_ALLOWED
            ) {
                // Target reached with OVER_NOT_ALLOWED: no more subscriptions, waiting for deadline
                return IPrimaryMarket.OfferingStatus.CLOSED;
            } else {
                // Still accepting subscriptions until deadline
                // - OVER_NOT_ALLOWED: only if target not yet reached (checked above)
                // - OVER_ALLOWED: always accepts, even after target reached
                return IPrimaryMarket.OfferingStatus.OPEN;
            }
        }
    }

    /**
     * @notice Internal implementation for getting total subscriptions
     * @param _offeringId Offering ID
     * @return total_ Total subscriptions
     */
    function _getTotalSubscriptions(uint256 _offeringId) internal view returns (uint256 total_) {
        return _getOfferingState(_offeringId).nextSubscriptionId;
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
        Subscription storage sub = _getOfferingState(_offeringId).subscriptions[_subscriptionId];

        if (sub.investor == address(0)) {
            revert IPrimaryMarket.OfferingDoesNotExist(_subscriptionId); // Reusing error for subscription not found
        }

        return (sub.investor, sub.lotUnits);
    }

    /**
     * @notice Get the next offering ID (total offerings created + 1)
     * @return Next offering ID that will be assigned
     */
    function _getNextOfferingId() internal view returns (uint256) {
        return _primaryMarketStorage().nextOfferingId;
    }

    /**
     * @notice Get offering state by ID
     * @param _offeringId Offering ID
     * @return Offering state storage pointer
     */
    function _getOfferingState(uint256 _offeringId) internal view returns (OfferingState storage) {
        return _primaryMarketStorage().offerings[_offeringId];
    }

    function _isOfferingStatus(
        uint256 _offeringId,
        IPrimaryMarket.OfferingStatus requiredStatus
    ) internal view returns (bool) {
        if (_getOfferingStatus(_offeringId) == requiredStatus) {
            return true;
        }
        return false;
    }

    function _isOfferingOperator(uint256 _offeringId, address _account) internal view returns (bool) {
        (, address offeringOperator) = _getOffering(_offeringId);
        if (offeringOperator == _account) {
            return true;
        }
        return false;
    }

    function _checkOfferingExists(uint256 _offeringId) internal view {
        if (_offeringId == 0 || _offeringId > _getNextOfferingId()) {
            revert IPrimaryMarket.OfferingDoesNotExist(_offeringId);
        }
    }

    function _checkSubscriptionExists(uint256 _offeringId, uint256 _subscriptionId) internal view {
        if (_getOfferingState(_offeringId).subscriptions[_subscriptionId].investor == address(0)) {
            revert IPrimaryMarket.SubscriptionDoesNotExist(_offeringId, _subscriptionId);
        }
    }

    /**
     * @notice Returns the storage
     * @return primaryMarketStorage Primary market storage
     */
    function _primaryMarketStorage() internal pure returns (PrimaryMarketStorage storage primaryMarketStorage) {
        bytes32 position = PRIMARY_MARKET_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            primaryMarketStorage.slot := position
        }
    }

    function _isValidAmount(uint256 amount) private pure returns (bool) {
        return amount > 0 && _valueFitsInInt64(amount);
    }

    function _valueFitsInInt64(uint256 value) internal pure returns (bool) {
        return value <= uint256(uint64(type(int64).max));
    }

    function _extractIds(uint256 _pageIndex, uint256 _pageLength) internal pure returns (uint256[] memory ids) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 length = end - start;
        ids = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            ids[i] = start + i;
        }
    }

    function _addToList(
        uint256[] memory subscriptionIds,
        uint256[] memory list,
        uint256 listIndex
    ) internal pure returns (uint256 newListIndex) {
        for (uint256 i = 0; i < subscriptionIds.length; i++) {
            list[listIndex] = subscriptionIds[i];
            listIndex++;
        }
        newListIndex = listIndex;
    }
}
