// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface ILifeCycleCashFlow {
    /*
     * @dev Emitted when a coupon by page is executed
     *
     * @param distributionID The coupon identifier
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
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a coupon by addresses is executed
     *
     * @param distributionID The coupon/dividend identifier
     * @param holders The holders addresses
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event DistributionByAddressesExecuted(
        uint256 distributionID,
        address[] holders,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a cash out by page is executed
     *
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param failed Holders addresses whose cash outs failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event CashOutExecuted(
        uint256 pageIndex,
        uint256 pageLength,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a cash out by addresses is executed
     *
     * @param holders The holders addresses
     * @param failed Holders addresses whose cash outs failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event CashOutByAddressesExecuted(
        address[] holders,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a token is associated with an account
     *
     * @param token The token the account is associated with
     */
    event TokenAssociated(address token);

    /**
     * @notice Error thrown when attempting to execute a payment for an asset not managed by the contract
     *
     * @param asset The address of the asset that is being tried to operate with
     */
    error InvalidAsset(address asset);

    /**
     * @notice Error thrown when attempting to execute a payment a date does not corresponds to the payment date
     * @param paymentDateInit The initial execution date
     * @param requestedDate The date a certain operation is requested to be made
     */
    error NotPaymentDate(uint256 paymentDateInit, uint256 requestedDate);

    // Initialization function
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(address asset) external;

    /*
     * @dev Pay a coupon to a page of holders
     *
     * @param asset The address of the asset that the coupon belongs to
     * @param distributionID The coupon identifier
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
    )
        external
        returns (address[] memory, address[] memory, uint256[] memory, bool);

    /*
     * @dev Retry the payment of a coupon to a list of holders
     *
     * @param asset The address of the asset that the coupon belongs to
     * @param distributionID The coupon identifier
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
    ) external returns (address[] memory, address[] memory, uint256[] memory);

    /*
     * @dev Perform a bond cash out to a page of holders
     *
     * @param bond The address of the bond for the cash out to be performed
     * @param pageIndex The index of the page whose cash outs will be performed
     * @param pageLenth The number of holders who owns the bond to be cashed out
     *
     * @return The array of the holders addresses whose cashes outs were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders for their bonds to be cashed out, and false otherwise
     */
    function executeBondCashOut(
        address bond,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        returns (address[] memory, address[] memory, uint256[] memory, bool);

    /*
     * @dev Perform a bond cash out to a list of holders
     *
     * @param bond The address of the bond for the cash out to be performed
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose cash outs were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeBondCashOutByAddresses(
        address bond,
        address[] calldata holders
    ) external returns (address[] memory, address[] memory, uint256[] memory);

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external returns (address asset);
}
