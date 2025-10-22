// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    LifeCycleCashFlowStorageWrapper
} from './LifeCycleCashFlowStorageWrapper.sol';
import {PAYOUT_ROLE, REDEMPTION_ROLE} from './constants/roles.sol';

abstract contract LifeCycleCashFlow is LifeCycleCashFlowStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(
        address asset
    )
        external
        override
        onlyUninitialized(_lifeCycleCashFlowStorage().initialized)
    {
        LifeCycleCashFlowStorage
            storage lifeCycleCashFlowStorage = _lifeCycleCashFlowStorage();
        _setAsset(asset);
        lifeCycleCashFlowStorage.initialized = true;
    }

    /*
     * @dev Pay a coupon or dividend to a page of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionId The coupon/dividend identifier
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
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    ) external override returns (PaymentResult memory result, bool executed) {
        // solhint-disable-next-line no-empty-blocks
    }

    /*
     * @dev Retry the payment of a coupon or dividend to a list of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionId The coupon/dividend identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeDistributionByAddresses(
        address asset,
        uint256 distributionId,
        address[] calldata holders
    ) external override returns (PaymentResult memory result) {
        // solhint-disable-next-line no-empty-blocks
    }

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
    ) external override returns (PaymentResult memory result, bool executed) {
        // solhint-disable-next-line no-empty-blocks
    }

    /*
     * @dev Perform a bond redemption to a list of holders
     *
     * @param bond The address of the bond for the redemption to be performed
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose redemptions were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeBondRedemptionByAddresses(
        address bond,
        address[] calldata holders
    ) external override returns (PaymentResult memory result) {
        // solhint-disable-next-line no-empty-blocks
    }

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external view returns (address) {
        return _getAsset();
    }
}
