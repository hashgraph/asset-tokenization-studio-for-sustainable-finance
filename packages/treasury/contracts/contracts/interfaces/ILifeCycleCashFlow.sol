// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface ILifeCycleCashFlow {
    /*
     * @dev Emitted when a coupon/dividend by page is executed
     *
     * @param distributionID The coupon/dividend identifier
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
     * @dev Emitted when a coupon/dividend by addresses is executed
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

    // Initialization function
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(address _asset) external;

    /*
     * @dev Pay a coupon or dividend to a page of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionID The coupon/dividend identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLenth The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function executeDistribution(
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        returns (address[] memory, address[] memory, uint256[] memory, bool);

    /*
     * @dev Retry the payment of a coupon or dividend to a list of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionID The coupon/dividend identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeDistributionByAddresses(
        address _asset,
        uint256 _distributionID,
        address[] calldata _holders
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
        address _bond,
        uint256 _pageIndex,
        uint256 _pageLength
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
        address _bond,
        address[] calldata _holders
    ) external returns (address[] memory, address[] memory, uint256[] memory);

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external returns (address asset_);
}
