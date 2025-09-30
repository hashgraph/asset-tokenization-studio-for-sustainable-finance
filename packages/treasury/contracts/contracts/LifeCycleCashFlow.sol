// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {ILifeCycleCashFlow} from './interfaces/ILifeCycleCashFlow.sol';
import {
    LifeCycleCashFlowStorageWrapper
} from './LifeCycleCashFlowStorageWrapper.sol';
import {
    _DEFAULT_ADMIN_ROLE,
    _PAUSER_ROLE,
    _PAYOUT_ROLE,
    _CASHOUT_ROLE
} from './constants/roles.sol';

abstract contract LifeCycleCashFlow is
    ILifeCycleCashFlow,
    LifeCycleCashFlowStorageWrapper
{
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(
        address _asset
    )
        external
        override
        onlyUninitialized(_lifeCycleCashFlowStorage().initialized)
    {
        LifeCycleCashFlowStorage
            storage lifeCycleCashFlowStorage = _lifeCycleCashFlowStorage();
        _grantRole(_DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(_PAUSER_ROLE, _msgSender());
        _grantRole(_PAYOUT_ROLE, _msgSender());
        _grantRole(_CASHOUT_ROLE, _msgSender());
        _setAsset(_asset);
        lifeCycleCashFlowStorage.initialized = true;
    }

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
        override
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        onlyOnDistributionDate(_asset, _distributionID)
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_,
            bool executed_
        )
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executeDistribution(
            _lifeCycleCashFlowStorage().asset,
            _distributionID,
            _pageIndex,
            _pageLength
        );

        emit DistributionExecuted(
            _distributionID,
            _pageIndex,
            _pageLength,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

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
    )
        external
        override
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        onlyOnDistributionDate(_asset, _distributionID)
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_
        )
    {
        (failed_, succeeded_, paidAmount_) = _executeDistributionByAddresses(
            _lifeCycleCashFlowStorage().asset,
            _distributionID,
            _holders
        );

        emit DistributionByAddressesExecuted(
            _distributionID,
            _holders,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

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
        override
        onlyUnpaused
        onlyRole(_CASHOUT_ROLE)
        isAsset(_bond)
        onlyOnMaturityDate(_bond)
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_,
            bool executed_
        )
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executeBondCashOut(
            _lifeCycleCashFlowStorage().asset,
            _pageIndex,
            _pageLength
        );

        emit CashOutExecuted(
            _pageIndex,
            _pageLength,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

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
    )
        external
        override
        onlyUnpaused
        onlyRole(_CASHOUT_ROLE)
        isAsset(_bond)
        onlyOnMaturityDate(_bond)
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_
        )
    {
        (failed_, succeeded_, paidAmount_) = _executeBondCashOutByAddresses(
            _bond,
            _holders
        );

        emit CashOutByAddressesExecuted(
            _holders,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external view returns (address asset_) {
        return _getAsset();
    }
}
