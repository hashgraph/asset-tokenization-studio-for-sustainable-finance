// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title IPrimaryMarket
/// @notice Interface for managing primary market offerings, subscriptions, and execution/cancellation logic.
interface IPrimaryMarket {
    /// @notice Rules for how the target quantity of an offering is treated
    enum TargetQuantityRule {
        OVERSUBSCRIPTION_NOT_ALLOWED,
        OVERSUBSCRIPTION_ALLOWED
    }

    /// @notice Rules for how the offering deadline is handled
    enum DeadlineRule {
        WAIT_UNTIL_END,
        CLOSE_TARGET_REACHED
    }

    /// @notice Structure representing a market offering
    /// @param asset The address of the asset being offered
    /// @param treasury The address receiving payments
    /// @param paymentToken The token used for payments
    /// @param lotSize Size of each lot in tokens (minimum tradable unit)
    /// @param minLots Minimum number of lots per investor (minLots * lotSize = minimum investment)
    /// @param maxLots Maximum number of lots per investor (maxLots * lotSize = maximum investment)
    /// @param targetLots Target number of lots for the offering (targetLots * lotSize = target amount)
    /// @param targetQuantityRule Rule for handling oversubscription
    /// @param startDate Timestamp when offering starts
    /// @param endDate Timestamp when offering ends
    /// @param deadlineRule Rule for handling deadlines
    struct Offering {
        address asset;
        address treasury;
        address paymentToken;
        uint256 lotSize;
        uint256 minLots;
        uint256 maxLots;
        uint256 targetLots;
        TargetQuantityRule targetQuantityRule;
        uint256 startDate;
        uint256 endDate;
        DeadlineRule deadlineRule;
    }

    /// @notice Emitted when a new offering is created
    /// @param offeringId The unique identifier for the offering
    /// @param operator The account that created the offering
    /// @param offering The offering details
    event OfferingCreated(uint256 indexed offeringId, address indexed operator, Offering offering);

    /// @notice Emitted when an investor submits a subscription
    /// @param offeringId The offering ID
    /// @param subscriptionId The subscription ID
    /// @param investor The investor submitting the subscription
    /// @param lotUnits Number of lot units subscribed
    event SubscriptionSubmitted(
        uint256 indexed offeringId,
        uint256 indexed subscriptionId,
        address indexed investor,
        uint256 lotUnits
    );

    /// @notice Emitted when a subscription is cancelled
    /// @param offeringId The offering ID
    /// @param subscriptionId The subscription ID
    event SubscriptionCancelled(uint256 indexed offeringId, uint256 indexed subscriptionId);

    /// @notice Emitted when an offering is executed
    /// @param offeringId The offering ID
    /// @param operator The operator executing the offering
    /// @param subscriptionIdsSuccess Array of successfully executed subscription IDs
    /// @param subscriptionIdsFailed Array of failed subscription IDs
    event OfferingExecuted(
        uint256 indexed offeringId,
        address indexed operator,
        uint256[] subscriptionIdsSuccess,
        uint256[] subscriptionIdsFailed
    );

    /// @notice Emitted when an offering is cancelled
    /// @param offeringId The offering ID
    /// @param operator The operator cancelling the offering
    /// @param subscriptionIdsSuccess Array of subscriptions successfully cancelled
    /// @param subscriptionIdsFailed Array of subscriptions that failed to cancel
    event OfferingCancelled(
        uint256 indexed offeringId,
        address indexed operator,
        uint256[] subscriptionIdsSuccess,
        uint256[] subscriptionIdsFailed
    );

    /// @notice Thrown when an account does not have enough funds for a subscription
    error NotEnoughFunds(address account, uint256 requiredFunds, uint256 availableFunds, address paymentToken);

    /// @notice Thrown when an account is not allowed to participate in an offering
    error NotCompliantAccount(address account, address asset);

    /// @notice Thrown when a subscription is submitted to a closed offering
    error SubscriptionNotAcceptedForOffering(uint256 offeringId);

    /// @notice Thrown when an account tries to operate on an offering it did not create
    error UnauthorizedAccountForOffering(address account, uint256 offeringId);

    /// @notice Thrown when trying to execute an offering that cannot be executed
    error OfferingCannotBeExecuted(uint256 offeringId);

    /// @notice Thrown when trying to cancel an offering that cannot be cancelled
    error OfferingCannotBeCancelled(uint256 offeringId);

    /// @notice Thrown when trying to operate on a non-existent offering
    error OfferingDoesNotExist(uint256 offeringId);

    /// @notice Thrown when creating an offering for an invalid asset
    error WrongAsset(address asset);

    /// @notice Thrown when creating an offering for an invalid treasury
    error WrongTreasury(address treasury);

    /// @notice Thrown when creating an offering with an invalid payment token
    error WrongPaymentToken(address paymentToken);

    /// @notice Thrown when creating an offering with inconsistent lot quantities
    error WrongQuantities(uint256 lotSize, uint256 minLots, uint256 maxLots, uint256 targetLots);

    /// @notice Thrown when creating an offering with inconsistent dates
    error WrongDates(uint256 startDate, uint256 endDate);

    /// @notice Create a new offering
    /// @param _offeringInfo The details of the offering to create
    function createOffering(Offering calldata _offeringInfo) external;

    /// @notice Submit a subscription to an offering
    /// @param _offeringId The offering ID
    /// @param _lotUnits Number of lot units to subscribe
    function submitSubscription(uint256 _offeringId, uint256 _lotUnits) external;

    /// @notice Execute an offering
    /// @param _offeringId The offering ID
    /// @param _pageIndex Pagination index for processing subscriptions
    /// @param _pageLength Number of subscriptions to process in this batch
    function executeOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external;

    /// @notice Cancel an offering
    /// @param _offeringId The offering ID
    /// @param _pageIndex Pagination index for processing subscriptions
    /// @param _pageLength Number of subscriptions to process in this batch
    function cancelOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external;

    /// @notice Cancel a specific subscription (only when it blocks execution)
    /// @param _offeringId The offering ID
    /// @param _subscriptionId The subscription ID
    function cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) external;

    /// @notice Get the total number of offerings
    /// @return total_ Total offerings
    function getTotalOfferings() external view returns (uint256 total_);

    /// @notice Get offering IDs with pagination
    /// @param _pageIndex Pagination index
    /// @param _pageLength Number of IDs per page
    /// @return ids Array of offering IDs
    function getOfferingIds(uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] memory ids);

    /// @notice Get details of a specific offering
    /// @param _offeringId The offering ID
    /// @return offeringInfo_ Offering details
    /// @return offeringOperator_ Operator who created the offering
    function getOffering(
        uint256 _offeringId
    ) external view returns (Offering memory offeringInfo_, address offeringOperator_);

    /// @notice Get total number of subscriptions for a specific offering
    /// @param _offeringId The offering ID
    /// @return total_ Total subscriptions
    function getTotalSubscriptions(uint256 _offeringId) external view returns (uint256 total_);

    /// @notice Get subscription IDs with pagination for a specific offering
    /// @param _offeringId The offering ID
    /// @param _pageIndex Pagination index
    /// @param _pageLength Number of IDs per page
    /// @return ids Array of subscription IDs
    function getSubscriptionIds(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory ids);

    /// @notice Get details of a specific subscription
    /// @param _offeringId The offering ID
    /// @param _subscriptionId The subscription ID
    /// @return investor_ Investor address
    /// @return lotUnits_ Number of lot units subscribed
    function getSubscription(
        uint256 _offeringId,
        uint256 _subscriptionId
    ) external view returns (address investor_, uint256 lotUnits_);
}
