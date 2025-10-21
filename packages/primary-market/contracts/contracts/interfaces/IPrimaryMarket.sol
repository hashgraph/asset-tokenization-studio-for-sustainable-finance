// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IPrimaryMarket {
    // ENUMS
    enum TargetQuantityRule {
        OVERSUBSCRIPTION_NOT_ALLOWED,
        OVERSUBSCRIPTION_ALLOWED
    }
    enum DeadlineRule {
        WAIT_UNTIL_END,
        CLOSE_TARGET_REACHED
    }

    // STRUCTS
    struct Offering {
        address asset;
        address treasury;
        address paymentToken;
        uint256 lotSize;
        uint256 minQuantity;
        uint256 maxQuantity;
        uint256 targetQuantity;
        TargetQuantityRule targetQuantityRule;
        uint256 startDate;
        uint256 endDate;
        DeadlineRule deadlineRule;
    }

    // EVENTS
    event OfferingCreated(uint256 indexed offeringId, address indexed operator, Offering offering);
    event SubscriptionSubmitted(
        uint256 indexed offeringId,
        uint256 indexed subscriptionId,
        address indexed investor,
        uint256 lotUnits
    );
    event SubscriptionCancelled(uint256 indexed offeringId, uint256 indexed subscriptionId);
    event OfferingExecuted(
        uint256 indexed offeringId,
        address indexed operator,
        uint256[] subscriptionIdsSuccess,
        uint256[] subscriptionIdsFailed
    );
    event OfferingCancelled(
        uint256 indexed offeringId,
        address indexed operator,
        uint256[] subscriptionIdsSuccess,
        uint256[] subscriptionIdsFailed
    );

    // ERRORS
    error NotEnoughFunds(address account, uint256 requiredFunds, uin256 availableFunds, address paymentToken); // When submitting subscription to Offering and account has not granted enough allowance to funds
    error NotCompliantAccount(address account, address asset); // When submitting subscription to Offering but account does not comply with assets restrictions (whitelist, ....)
    error SubscriptionNotAcceptedForOffering(uint256 offeringId); // When submitting subsciption to closed Offerings (Offerings that are ready to execute or cancel);
    error UnauthorizedAccountForOffering(address account, uint256 offeringId); // When executing/cancelling an Offering you did not create
    error OfferingCannotBeExecuted(uint256 offeringId); // When executing an Offering that cannot be executed (either yet or never)
    error OfferingCannotBeCancelled(uint256 offeringId); // When executing an Offering that cannot be cancelled (either yet or never)
    error OfferingDoesNotExist(uint256 offeringId); // When subscribing, executing or cancelling a non existing Offering
    error WrongAsset(address asset); // When creating an Offering for a non existing or non compliant Asset
    error WrongTreasury(address treasury); // When creating an Offering for a non existing or non compliant Treasury
    error WrongPaymentToken(address paymentToken); // When creating an Offering for a non existing or non compliant Treasury
    error WrongQuantities(uint256 lotSize, uint256 minQuantity, uint256 maxQuantity, uint256 targetQuantity); // When creating an Offering with inconsistent or incompatible quantities or sizes
    error WrongDates(uint256 startDate, uint256 endDate); // When creating an Offering with inconsistent or incompatible dates

    // FUNCTIONS
    function createOffering(Offering calldata _offeringInfo) external;
    function submitSubscription(uint256 _offeringId, uint256 _lotUnits) external;
    function executeOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external;
    function cancelOffering(uint256 _offeringId, uint256 _pageIndex, uint256 _pageLength) external;
    function cancelSubscription(uint256 _offeringId, uint256 _subscriptionId) external; // This method should be executed only when an Offering is executed an some specific subscription is blocking

    // VIEW FUNCTIONS
    function getTotalOfferings() external view returns (uint256 total_);
    function getOfferingIds(uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] ids);
    function getOffering(
        uint256 _offeringId
    ) external view returns (Offering memory offeringInfo_, address offeringOperator_);

    function getTotalSubscriptions(uint256 _offeringId) external view returns (uint256 total_);
    function getSubscriptionIds(
        uint256 _offeringId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] ids);
    function getSubscription(
        uint256 _offeringId,
        uint256 _subscriptionId
    ) external view returns (address investor_, uint256 lotUnits_);
}
