// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PRIMARY_MARKET_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";
import { IERC1594 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC1594.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
import { LibCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_0/common/libraries/LibCommon.sol";
import {
    HederaTokenService,
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
// solhint-enable max-line-length

/**
 * @title PrimaryMarketStorageWrapper
 * @notice Storage layout for Primary Market facet using diamond storage pattern
 * @dev Uses EIP-2535 Diamond Storage pattern to avoid storage collisions
 */
abstract contract PrimaryMarketStorageWrapper is AtsCommon, HederaTokenService {
    using SafeERC20 for IERC20;

    // only for insternal use
    enum CountIndex {
        PROCESSED_SUBSCRIPTION_INDEX,
        SUBSCRIPTION_ID_INDEX,
        TRANSFER_INDEX
    }
    uint256 internal constant _COUNT_INDEX_SIZE = 3;

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

    struct DecimalsAdjustmentInfo {
        bool multiply;
        uint256 factor;
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
        mapping(uint256 => IPrimaryMarket.Subscription) subscriptions; // subscriptionId => Subscription
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

        // If price is 0, set it to the bond's nominal value
        if (offering.info.price == 0) {
            offering.info.price = IBondRead(offering.info.asset).getBondDetails().nominalValue;
            offering.info.priceDecimals = IBondRead(offering.info.asset).getBondDetails().nominalValueDecimals;
        }

        offering.creator = _msgSender();
        // executed and cancelled default to false
        offering.totalSubscribedLots = 0;
        offering.pendingSubscribedLots = 0;
        offering.nextSubscriptionId = 0;

        // Associate payment token with this contract (Hedera token association)
        if (associateToken(address(this), _offeringInfo.paymentToken) != HederaResponseCodes.SUCCESS) {
            revert IPrimaryMarket.AssociationFailed(_offeringInfo.paymentToken);
        }

        emit IPrimaryMarket.OfferingCreated(offeringId, _msgSender(), offering.info);
    }

    /**
     * @notice Internal implementation for submitting a subscription
     * @param _offeringId The offering ID
     * @param _lotUnits Number of lots to subscribe
     * @dev All validations are handled by modifiers in the public function
     */
    function _submitSubscription(uint256 _offeringId, uint256 _lotUnits) internal {
        OfferingState storage offering = _getOfferingState(_offeringId);

        // CHECKS: Calculate required payment and validate allowance
        uint256 assetDecimals = IERC20Metadata(offering.info.asset).decimals();
        DecimalsAdjustmentInfo memory decimalsAdjustmentInfo = _calculateDecimalsAdjustmentInfo(
            offering.info.priceDecimals,
            offering.info.paymentToken
        );
        uint256 requiredPayment = _adjustDecimals(
            _lotUnits * offering.info.lotSize * offering.info.price,
            decimalsAdjustmentInfo
        ) / 10 ** assetDecimals;

        assert(_isValidAmount(requiredPayment)); // should never fail

        if (IERC20(offering.info.paymentToken).allowance(_msgSender(), address(this)) < requiredPayment) {
            revert IPrimaryMarket.NotEnoughFunds(
                _msgSender(),
                requiredPayment,
                IERC20(offering.info.paymentToken).allowance(_msgSender(), address(this)),
                offering.info.paymentToken
            );
        }

        // EFFECTS: Update state before external calls
        uint256 subscriptionId = ++offering.nextSubscriptionId;
        offering.subscriptions[subscriptionId] = IPrimaryMarket.Subscription({
            investor: _msgSender(),
            lotUnits: _lotUnits,
            amountPaid: requiredPayment,
            status: IPrimaryMarket.SubscriptionStatus.ACTIVE
        });

        offering.totalSubscribedLots += _lotUnits;
        offering.pendingSubscribedLots += _lotUnits;

        // INTERACTIONS: External call last
        IERC20 token = IERC20(offering.info.paymentToken);
        token.transferFrom(_msgSender(), address(this), requiredPayment);

        emit IPrimaryMarket.SubscriptionSubmitted(_offeringId, subscriptionId, _msgSender(), _lotUnits);
    }

    /**
     * @notice Internal placeholder for cancelling a subscription
     * @param _offeringId Offering ID
     */
    function _cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) internal {
        OfferingState storage offering = _getOfferingState(_offeringId);
        IPrimaryMarket.Subscription storage subscription = offering.subscriptions[_subscriptionId];

        if (subscription.status != IPrimaryMarket.SubscriptionStatus.ACTIVE) {
            revert IPrimaryMarket.SubscriptionIsNotActive(_offeringId, _subscriptionId);
        }

        // EFFECTS: Update state first
        subscription.status = IPrimaryMarket.SubscriptionStatus.CANCELLED;
        offering.pendingSubscribedLots -= subscription.lotUnits;

        // INTERACTIONS: External call last
        IERC20 token = IERC20(offering.info.paymentToken);
        token.transfer(subscription.investor, subscription.amountPaid);
    }

    function _executeOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (IPrimaryMarket.OfferingProcessResult[] memory executionResult) {
        return _executeOfferingBySubscriptionIds(_offeringId, _extractIds(_pageIndex, _pageLength));
    }

    function _executeOfferingBySubscriptionIds(
        uint256 _offeringId,
        uint256[] memory _subscriptionIds
    ) internal returns (IPrimaryMarket.OfferingProcessResult[] memory executionResult) {
        executionResult = _processOffering(ProcessOfferingInfo(_offeringId, _subscriptionIds, true, 0));
        emit IPrimaryMarket.OfferingExecuted(_offeringId, _msgSender(), executionResult);
        return executionResult;
    }

    function _cancelOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (IPrimaryMarket.OfferingProcessResult[] memory cancelResult) {
        return _cancelOfferingBySubscriptionIds(_offeringId, _extractIds(_pageIndex, _pageLength));
    }

    function _cancelOfferingBySubscriptionIds(
        uint256 _offeringId,
        uint256[] memory _subscriptionIds
    ) internal returns (IPrimaryMarket.OfferingProcessResult[] memory cancelResult) {
        cancelResult = _processOffering(ProcessOfferingInfo(_offeringId, _subscriptionIds, false, 0));
        emit IPrimaryMarket.OfferingCancelled(_offeringId, _msgSender(), cancelResult);
        return cancelResult;
    }

    function _processOffering(
        ProcessOfferingInfo memory _processOfferingInfo
    ) internal returns (IPrimaryMarket.OfferingProcessResult[] memory processResult) {
        processResult = new IPrimaryMarket.OfferingProcessResult[](
            _processOfferingInfo.subscriptionIdsToProcess.length
        );

        uint256[] memory subscriptionIds = new uint256[](_processOfferingInfo.subscriptionIdsToProcess.length);
        uint256[] memory indexCounts = new uint256[](_COUNT_INDEX_SIZE);

        uint256 transfersLength = _processOfferingInfo.isExecution
            ? 2
            : _processOfferingInfo.subscriptionIdsToProcess.length + 1;

        TransferItem[] memory transferItems = new TransferItem[](transfersLength);
        int64 totalToTransfer;
        uint256 totalLots;

        OfferingState storage offering = _getOfferingState(_processOfferingInfo.offeringId);

        if (_processOfferingInfo.isExecution) transferItems[0].destination = offering.info.treasury;

        _processOfferingInfo.nominalValue = offering.info.price;

        for (uint256 index = 0; index < _processOfferingInfo.subscriptionIdsToProcess.length; ++index) {
            (totalToTransfer, totalLots) = _processSubscription(
                offering,
                _processOfferingInfo,
                _processOfferingInfo.subscriptionIdsToProcess[index],
                processResult,
                indexCounts,
                subscriptionIds,
                totalToTransfer,
                transferItems,
                totalLots
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
            indexCounts,
            totalLots
        );
    }

    // solhint-disable-next-line function-max-lines
    function _processSubscription(
        OfferingState storage offering,
        ProcessOfferingInfo memory _processOfferingInfo,
        uint256 subscriptionId,
        IPrimaryMarket.OfferingProcessResult[] memory processResult,
        uint256[] memory indexCounts,
        uint256[] memory subscriptionIds,
        int64 totalToTransfer,
        TransferItem[] memory transferItems,
        uint256 totalLots
    ) internal returns (int64 totalToTransferUpdated_, uint256 totalLotsUpdated_) {
        _checkSubscriptionExists(_processOfferingInfo.offeringId, subscriptionId);

        totalToTransferUpdated_ = totalToTransfer;
        totalLotsUpdated_ = totalLots;

        IPrimaryMarket.Subscription storage subscription = offering.subscriptions[subscriptionId];

        if (subscription.status != IPrimaryMarket.SubscriptionStatus.ACTIVE) {
            processResult[indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)]] = IPrimaryMarket
                .OfferingProcessResult({
                    subscriptionId: subscriptionId,
                    status: IPrimaryMarket.OfferingProcessStatus.ALREADY_PROCESSED
                });
            ++indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)];
            return (totalToTransferUpdated_, totalLotsUpdated_);
        }

        if (!_valueFitsInInt64(uint256(uint64(totalToTransferUpdated_)) + subscription.amountPaid)) {
            _payBatch(
                offering,
                _processOfferingInfo,
                offering.info.paymentToken,
                transferItems,
                totalToTransferUpdated_,
                subscriptionIds,
                processResult,
                indexCounts,
                totalLotsUpdated_
            );

            //reset
            totalToTransferUpdated_ = 0;
            totalLotsUpdated_ = 0;
            indexCounts[uint256(CountIndex.TRANSFER_INDEX)] = 0;
            indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)] = 0;
            if (_processOfferingInfo.isExecution) transferItems[0].destination = offering.info.treasury;
        }

        subscriptionIds[indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)]] = subscriptionId;
        ++indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)];

        totalToTransferUpdated_ += int64(int256(subscription.amountPaid));
        totalLotsUpdated_ += subscription.lotUnits;

        if (_processOfferingInfo.isExecution) {
            transferItems[0].amount = totalToTransferUpdated_;
        } else {
            transferItems[indexCounts[uint256(CountIndex.TRANSFER_INDEX)]].amount = int64(
                int256(subscription.amountPaid)
            );
            transferItems[indexCounts[uint256(CountIndex.TRANSFER_INDEX)]].destination = subscription.investor;
            ++indexCounts[uint256(CountIndex.TRANSFER_INDEX)];
        }
    }

    // solhint-disable-next-line function-max-lines
    function _payBatch(
        OfferingState storage offering,
        ProcessOfferingInfo memory _processOfferingInfo,
        address paymentToken,
        TransferItem[] memory transferItems,
        int64 totalToTransfer,
        uint256[] memory subscriptionIds,
        IPrimaryMarket.OfferingProcessResult[] memory processResult,
        uint256[] memory indexCounts,
        uint256 totalLots
    ) private {
        uint256 nextIndex = _processOfferingInfo.isExecution ? 1 : indexCounts[uint256(CountIndex.TRANSFER_INDEX)];
        transferItems[nextIndex].amount = -totalToTransfer;
        transferItems[nextIndex].destination = address(this);

        int64[] memory amounts = new int64[](nextIndex + 1);
        address[] memory destinations = new address[](nextIndex + 1);

        for (uint256 i = 0; i < nextIndex + 1; ++i) {
            amounts[i] = transferItems[i].amount;
            destinations[i] = transferItems[i].destination;
        }

        if (transferTokens(paymentToken, destinations, amounts) == HederaResponseCodes.SUCCESS) {
            indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)] = _addToList(
                subscriptionIds,
                indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)],
                processResult,
                indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)],
                IPrimaryMarket.OfferingProcessStatus.SUCCEEDED
            );
            for (uint256 i = 0; i < indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)]; ++i) {
                if (_processOfferingInfo.isExecution) {
                    offering.subscriptions[subscriptionIds[i]].status = IPrimaryMarket.SubscriptionStatus.EXECUTED;

                    uint256 amountToMint = offering.subscriptions[subscriptionIds[i]].lotUnits * offering.info.lotSize;

                    IERC1594(offering.info.asset).issue(
                        offering.subscriptions[subscriptionIds[i]].investor,
                        amountToMint,
                        "0x"
                    );
                } else offering.subscriptions[subscriptionIds[i]].status = IPrimaryMarket.SubscriptionStatus.CANCELLED;
            }
            offering.pendingSubscribedLots -= totalLots;
            return;
        }
        indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)] = _addToList(
            subscriptionIds,
            indexCounts[uint256(CountIndex.SUBSCRIPTION_ID_INDEX)],
            processResult,
            indexCounts[uint256(CountIndex.PROCESSED_SUBSCRIPTION_INDEX)],
            IPrimaryMarket.OfferingProcessStatus.FAILED
        );
    }

    function _calculateDecimalsAdjustmentInfo(
        uint8 nominalValueDecimals,
        address paymentToken
    ) private view returns (DecimalsAdjustmentInfo memory decimalsAdjustmentInfo) {
        uint8 paymentTokenDecimals = IERC20Metadata(paymentToken).decimals();

        decimalsAdjustmentInfo = DecimalsAdjustmentInfo(false, 1);

        if (nominalValueDecimals == paymentTokenDecimals) return decimalsAdjustmentInfo;

        uint256 decimalDiff = 0;

        if (nominalValueDecimals > paymentTokenDecimals) {
            decimalDiff = uint256(uint8(nominalValueDecimals - paymentTokenDecimals));
        } else {
            decimalDiff = uint256(uint8(paymentTokenDecimals - nominalValueDecimals));
            decimalsAdjustmentInfo.multiply = true;
        }
        decimalsAdjustmentInfo.factor = 10 ** decimalDiff;
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
    )
        internal
        view
        returns (
            IPrimaryMarket.Offering memory offeringInfo_,
            address offeringOperator_,
            uint256 totalSubscribedLots_,
            uint256 pendingSubscribedLots_
        )
    {
        OfferingState storage offering = _getOfferingState(_offeringId);
        return (offering.info, offering.creator, offering.totalSubscribedLots, offering.pendingSubscribedLots);
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
        bool targetReached = offering.totalSubscribedLots > offering.info.targetLots - 1;

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

    function _getSubscription(
        uint256 _offeringId,
        uint256 _subscriptionId
    ) internal view returns (IPrimaryMarket.Subscription memory subscription) {
        return _getOfferingState(_offeringId).subscriptions[_subscriptionId];
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
        (, address offeringOperator, , ) = _getOffering(_offeringId);
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
        if (
            _getOfferingState(_offeringId).subscriptions[_subscriptionId].status ==
            IPrimaryMarket.SubscriptionStatus.NONE
        ) {
            revert IPrimaryMarket.SubscriptionDoesNotExist(_offeringId, _subscriptionId);
        }
    }

    function _checkOfferingOperator(uint256 _offeringId, address account) internal view {
        if (!_isOfferingOperator(_offeringId, account)) {
            revert IPrimaryMarket.UnauthorizedAccountForOffering(account, _offeringId);
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

    function _valueFitsInInt64(uint256 value) internal pure returns (bool) {
        return value < uint256(uint64(type(int64).max)) + 1;
    }

    function _extractIds(uint256 _pageIndex, uint256 _pageLength) internal pure returns (uint256[] memory ids) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 length = end - start;
        ids = new uint256[](length);
        for (uint256 i = 0; i < length; ++i) {
            ids[i] = start + i + 1;
        }
    }

    function _addToList(
        uint256[] memory subscriptionIds,
        uint256 subscriptionIdLastIndex,
        IPrimaryMarket.OfferingProcessResult[] memory list,
        uint256 listInitialIndex,
        IPrimaryMarket.OfferingProcessStatus status
    ) internal pure returns (uint256 newListInitialIndex) {
        newListInitialIndex = listInitialIndex;

        for (uint256 i = 0; i < subscriptionIdLastIndex; ++i) {
            list[newListInitialIndex] = IPrimaryMarket.OfferingProcessResult({
                subscriptionId: subscriptionIds[i],
                status: status
            });
            ++newListInitialIndex;
        }
    }

    function _isValidAmount(uint256 amount) private pure returns (bool) {
        return amount > 0 && _valueFitsInInt64(amount);
    }

    function _adjustDecimals(
        uint256 amount,
        DecimalsAdjustmentInfo memory decimalsAdjustmentInfo
    ) private pure returns (uint256 adjustedAmount) {
        adjustedAmount = amount;

        if (decimalsAdjustmentInfo.factor > 1) {
            if (decimalsAdjustmentInfo.multiply) {
                adjustedAmount = amount * decimalsAdjustmentInfo.factor;
            } else {
                adjustedAmount = amount / decimalsAdjustmentInfo.factor;
            }
        }
    }
}
