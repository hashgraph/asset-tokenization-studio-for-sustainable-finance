// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface ILifeCycleCashFlow {
    struct DistributionPaymentResult {
        address[] failedAddresses;
        address[] succeededAddresses;
        address[] alreadyPaidAddresses;
        uint256[] paidAmounts;
    }

    struct RedemptionPaymentResult {
        address[] failedAddresses;
        address[] succeededAddresses;
        uint256[] paidAmounts;
    }

    /*
     * @dev Emitted when a distribution by page is executed
     *
     * @param distributionID The distribution identifier
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event DistributionExecuted(
        uint256 distributionID,
        uint256 pageIndex,
        uint256 pageLength,
        DistributionPaymentResult result
    );

    /*
     * @dev Emitted when a distribution by addresses is executed
     *
     * @param distributionID The distribution/dividend identifier
     * @param holders The holders addresses
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event DistributionByAddressesExecuted(
        uint256 distributionID,
        address[] holders,
        DistributionPaymentResult result
    );

    /*
     * @dev Emitted when a redemption by page is executed
     *
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param failed Holders addresses whose redemptions failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event RedemptionExecuted(
        uint256 pageIndex,
        uint256 pageLength,
        RedemptionPaymentResult result
    );

    /*
     * @dev Emitted when a redemption by addresses is executed
     *
     * @param holders The holders addresses
     * @param failed Holders addresses whose redemptions failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event RedemptionByAddressesExecuted(
        address[] holders,
        RedemptionPaymentResult result
    );

    /**
     * @notice Error thrown when attempting to execute a payment for a asset not managed by the contract
     *
     * @param asset The address of the asset that is being tried to operate with
     */
    error InvalidAsset(address asset);

    /**
     * @notice Error thrown when attempting to execute a payment a date does not corresponds to the payment date
     *
     * @param paymentDateInit The initial execution date
     * @param requestedDate The date a certain operation is requested to be made
     */
    error NotPaymentDate(uint256 paymentDateInit, uint256 requestedDate);

    /**
     * @notice Error thrown when trying to get the decimals of the payment token
     *
     * @param token The address of the token whose decimals were tried to be fetched
     * @param responseCode The response code returned by the token service
     */
    error GetTokenDecimalsFailed(address token, int256 responseCode);

    /**
     * @notice Error thrown when trying to get the decimals of the asset
     *
     * @param asset The address of the asset whose decimals were tried to be fetched
     */
    error GetAssetDecimalsFailed(address asset);

    /**
     * @notice Error thrown when token decimals are greater than uint8
     *
     * @param token The address of the token whose decimals are invalid
     * @param decimals The decimals value returned by the token service
     */
    error InvalidTokenDecimals(address token, int32 decimals);

    /**
     * @notice Error thrown when getting the bond token balance by partition fails
     *
     * @param bond The address of the bond token whose balance was tried to be fetched
     * @param holder The address of the holder whose balance was tried to be fetched
     * @param partition The partition of the bond token whose balance was tried to be fetched
     */
    error BalanceOfByPartitionError(
        address bond,
        address holder,
        bytes32 partition
    );

    /**
     * @notice Error thrown when redeeming at maturity by partition for a holder fails
     *
     * @param bond The address of the bond token whose balance was tried to be fetched
     * @param holder The address of the holder whose balance was tried to be fetched
     * @param partition The partition of the bond token whose balance was tried to be fetched
     */
    error RedeemAtMaturityByPartitionError(
        address bond,
        address holder,
        bytes32 partition
    );

    /**
     * @notice Error thrown when the asset nominal value could not be fetched
     *
     * @param asset The address of the asset whose nominal value could not be fetched
     */
    error AssetNominalValueError(address asset);

    // Initialization function
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(address asset) external;

    /*
     * @dev Pay a distribution to a page of holders
     *
     * @param asset The address of the asset that the distribution belongs to
     * @param distributionID The distribution identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLenth The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function executeDistribution(
        address asset,
        uint256 distributionID,
        uint256 pageIndex,
        uint256 pageLength
    ) external returns (DistributionPaymentResult memory result, bool);

    /*
     * @dev Retry the payment of a distribution to a list of holders
     *
     * @param asset The address of the asset that the distribution belongs to
     * @param distributionID The distribution identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeDistributionByAddresses(
        address asset,
        uint256 distributionID,
        address[] calldata holders
    ) external returns (DistributionPaymentResult memory result);

    /*
     * @dev Perform a bond redemption to a page of holders
     *
     * @param bond The address of the bond for the redemption to be performed
     * @param pageIndex The index of the page whose redemptions will be performed
     * @param pageLenth The number of holders who owns the bond to be redeemed
     *
     * @return The array of the holders addresses whose redemptions were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders for their bonds to be redeemed, and false otherwise
     */
    function executeBondRedemption(
        address bond,
        uint256 pageIndex,
        uint256 pageLength
    ) external returns (RedemptionPaymentResult memory result, bool);

    /*
     * @dev Perform a bond redemption to a list of holders
     *
     * @param bond The address of the bond for the redemption to be performed
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose redemption were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeBondRedemptionByAddresses(
        address bond,
        address[] calldata holders
    ) external returns (RedemptionPaymentResult memory result);

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external returns (address asset);
}
