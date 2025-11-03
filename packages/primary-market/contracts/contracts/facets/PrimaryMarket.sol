// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrimaryMarket } from "../interfaces/IPrimaryMarket.sol";
import { PrimaryMarketStorageWrapper } from "./PrimaryMarketStorageWrapper.sol";
import { OFFERING_CREATOR_ROLE } from "../constants/roles.sol";

/**
 * @title PrimaryMarket
 * @notice Core implementation of Primary Market functionality for managing offerings and subscriptions
 * @dev Abstract contract implementing IPrimaryMarket interface
 */
abstract contract PrimaryMarket is IPrimaryMarket, PrimaryMarketStorageWrapper {
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

        // Validate lot quantities
        if (
            _offeringInfo.lotSize == 0 ||
            _offeringInfo.minLots == 0 ||
            _offeringInfo.maxLots == 0 ||
            _offeringInfo.targetLots == 0 ||
            _offeringInfo.minLots > _offeringInfo.maxLots
        ) {
            revert WrongQuantities(
                _offeringInfo.lotSize,
                _offeringInfo.minLots,
                _offeringInfo.maxLots,
                _offeringInfo.targetLots
            );
        }

        // Validate dates
        if (_offeringInfo.startDate >= _offeringInfo.endDate || _offeringInfo.startDate < _blockTimestamp()) {
            revert WrongDates(_offeringInfo.startDate, _offeringInfo.endDate);
        }

        // Validate rule combination: OVERSUBSCRIPTION_ALLOWED + CLOSE_TARGET_REACHED is not allowed
        if (
            _offeringInfo.targetQuantityRule == TargetQuantityRule.OVERSUBSCRIPTION_ALLOWED &&
            _offeringInfo.deadlineRule == DeadlineRule.CLOSE_TARGET_REACHED
        ) {
            revert InvalidRuleCombination(_offeringInfo.targetQuantityRule, _offeringInfo.deadlineRule);
        }

        _;
    }

    /**
     * @notice Validates offering exists
     * @param _offeringId Offering ID to check
     */
    modifier offeringExists(uint256 _offeringId) {
        if (_offeringId == 0 || _offeringId > _getNextOfferingId()) {
            revert OfferingDoesNotExist(_offeringId);
        }
        _;
    }

    /**
     * @notice Validates offering is in OPEN status (accepting subscriptions)
     * @param _offeringId Offering ID to check
     */
    modifier offeringIsOpen(uint256 _offeringId) {
        if (!_isOfferingStatus(_offeringId, IPrimaryMarket.OfferingStatus.OPEN)) {
            revert SubscriptionNotAcceptedForOffering(_offeringId);
        }
        _;
    }

    modifier offeringIsReadyForExecution(uint256 _offeringId) {
        if (!_isOfferingStatus(_offeringId, IPrimaryMarket.OfferingStatus.EXECUTABLE)) {
            revert OfferingCannotBeExecuted(_offeringId);
        }
        _;
    }

    modifier offeringIsReadyForCancellation(uint256 _offeringId) {
        if (!_isOfferingStatus(_offeringId, IPrimaryMarket.OfferingStatus.CANCELLABLE)) {
            revert OfferingCannotBeCancelled(_offeringId);
        }
        _;
    }

    modifier checkOfferingOperator(uint256 _offeringId) {
        if (!_isOfferingOperator(_offeringId, _msgSender())) {
            revert UnauthorizedAccountForOffering(_msgSender(), _offeringId);
        }
        _;
    }

    /**
     * @notice Validates lot units are within allowed range
     * @param _offeringId Offering ID to get min/max lots
     * @param _lotUnits Lot units to validate
     */
    modifier validLotUnits(uint256 _offeringId, uint256 _lotUnits) {
        Offering memory offering = _getOfferingState(_offeringId).info;
        if (_lotUnits < offering.minLots || _lotUnits > offering.maxLots) {
            revert InvalidSubscriptionLotUnits(_lotUnits, offering.minLots, offering.maxLots);
        }
        _;
    }

    /**
     * @notice Validates investor is compliant for the asset
     * @param _offeringId Offering ID to get asset address
     */
    modifier compliantInvestor(uint256 _offeringId) {
        address asset = _getOfferingState(_offeringId).info.asset;
        if (!_isCompliantInvestor(_msgSender(), asset)) {
            revert NotCompliantAccount(_msgSender(), asset);
        }
        _;
    }

    /**
     * @notice Validates subscription doesn't exceed target (when OVERSUBSCRIPTION_NOT_ALLOWED)
     * @param _offeringId Offering ID
     * @param _lotUnits Lot units being subscribed
     */
    modifier withinTargetLimit(uint256 _offeringId, uint256 _lotUnits) {
        OfferingState storage offering = _getOfferingState(_offeringId);
        if (offering.info.targetQuantityRule == TargetQuantityRule.OVERSUBSCRIPTION_NOT_ALLOWED) {
            uint256 newTotal = offering.totalSubscribedLots + _lotUnits;
            if (newTotal > offering.info.targetLots) {
                revert SubscriptionExceedsTarget(offering.totalSubscribedLots, _lotUnits, offering.info.targetLots);
            }
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
        _createOffering(_offeringInfo);
    }

    /**
     * @notice Submit a subscription to an offering
     * @param _offeringId The offering ID
     * @param _lotUnits Number of lots to subscribe (must be between minLots and maxLots)
     */
    function submitSubscription(
        uint256 _offeringId,
        uint256 _lotUnits
    )
        external
        override
        onlyUnpaused
        offeringExists(_offeringId)
        offeringIsOpen(_offeringId)
        compliantInvestor(_offeringId)
        validLotUnits(_offeringId, _lotUnits)
        withinTargetLimit(_offeringId, _lotUnits)
    {
        _submitSubscription(_offeringId, _lotUnits);
    }

    /**
     * @notice Execute an offering
     * @param _offeringId The offering ID
     * @param _pageIndex Pagination index for processing subscriptions
     * @param _pageLength Number of subscriptions to process in this batch
     */
    function executeOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        override
        onlyUnpaused
        offeringExists(_offeringId)
        offeringIsReadyForExecution(_offeringId)
        checkOfferingOperator(_offeringId)
        returns (OfferingProcessResult memory executionResult)
    {
        return _executeOffering(_offeringId, _pageIndex, _pageLength);
    }

    /**
     * @notice Cancel an offering
     * @param _offeringId The offering ID
     * @param _pageIndex Pagination index for processing subscriptions
     * @param _pageLength Number of subscriptions to process in this batch
     */
    function cancelOffering(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        override
        onlyUnpaused
        offeringExists(_offeringId)
        offeringIsReadyForCancellation(_offeringId)
        checkOfferingOperator(_offeringId)
        returns (OfferingProcessResult memory cancelResult)
    {
        return _cancelOffering(_offeringId, _pageIndex, _pageLength);
    }

    /**
     * @notice Cancel a specific subscription (only when it blocks execution)
     * @param _offeringId The offering ID
     * @param _subscriptionId The subscription ID
     */
    function cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) external override {
        _cancelSubscription(_offeringId, _subscriptionId);
    }

    /**
     * @notice Get total number of offerings
     * @return total_ Total offerings created
     */
    function getTotalOfferings() external view override returns (uint256 total_) {
        return _getTotalOfferings();
    }

    /**
     * @notice Get offering IDs with pagination
     * @param _pageIndex Page index (0-based)
     * @param _pageLength Number of IDs per page
     * @return ids Array of offering IDs
     */
    function getOfferingIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory ids) {
        return _getOfferingIds(_pageIndex, _pageLength);
    }

    /**
     * @notice Get offering details
     * @param _offeringId Offering ID
     * @return offeringInfo_ Offering information
     * @return offeringOperator_ Address that created the offering
     */
    function getOffering(
        uint256 _offeringId
    )
        external
        view
        override
        offeringExists(_offeringId)
        returns (Offering memory offeringInfo_, address offeringOperator_)
    {
        return _getOffering(_offeringId);
    }

    /**
     * @notice Get the current status of an offering (calculated dynamically)
     * @param _offeringId Offering ID
     * @return status_ Current offering status
     */
    function getOfferingStatus(
        uint256 _offeringId
    ) external view override offeringExists(_offeringId) returns (OfferingStatus status_) {
        return _getOfferingStatus(_offeringId);
    }

    /**
     * @notice Get total subscriptions for an offering
     * @param _offeringId Offering ID
     * @return total_ Total subscriptions
     */
    function getTotalSubscriptions(
        uint256 _offeringId
    ) external view override offeringExists(_offeringId) returns (uint256 total_) {
        return _getTotalSubscriptions(_offeringId);
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
        return _getSubscriptionIds(_offeringId, _pageIndex, _pageLength);
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
        return _getSubscription(_offeringId, _subscriptionId);
    }
}
