// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { ILifeCycleCashFlowStorageWrapper } from "./ILifeCycleCashFlowStorageWrapper.sol";

interface ILifeCycleCashFlow is ILifeCycleCashFlowStorageWrapper {
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
