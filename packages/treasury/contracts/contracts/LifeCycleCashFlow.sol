// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import {
    LifeCycleCashFlowStorageWrapper
} from './LifeCycleCashFlowStorageWrapper.sol';
import {PAYOUT_ROLE, REDEMPTION_ROLE, PAUSER_ROLE} from './constants/roles.sol';
import {ILifeCycleCashFlow} from './interfaces/ILifeCycleCashFlow.sol';
import {
    Pause
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol';
import {
    AccessControl
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol';

abstract contract LifeCycleCashFlow is
    ILifeCycleCashFlow,
    LifeCycleCashFlowStorageWrapper,
    Pause,
    AccessControl
{
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(
        address bond
    )
        external
        override
        notAddressZero(bond)
        onlyUninitialized(_lifeCycleCashFlowStorage().initialized)
    {
        LifeCycleCashFlowStorage
            storage lifeCycleCashFlowStorage = _lifeCycleCashFlowStorage();
        _setBond(bond);
        lifeCycleCashFlowStorage.initialized = true;
    }

    /*
     * @dev Pay a coupon or dividend to a page of holders
     *
     * @param bond The address of the bond that the coupon/dividend belongs to
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
        address bond,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        isBond(bond)
        onlyOnDistributionDate(bond, distributionId)
        returns (PaymentResult memory result, bool executed)
    {
        (result, executed) = _executeDistribution(
            _lifeCycleCashFlowStorage().bond,
            distributionId,
            pageIndex,
            pageLength
        );

        emit DistributionExecuted(
            distributionId,
            pageIndex,
            pageLength,
            result
        );
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
        address bond,
        uint256 distributionId,
        address[] calldata holders
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        isBond(bond)
        onlyOnDistributionDate(bond, distributionId)
        returns (PaymentResult memory result)
    {
        result = _executeDistributionByAddresses(
            _lifeCycleCashFlowStorage().bond,
            distributionId,
            holders
        );

        emit DistributionByAddressesExecuted(distributionId, holders, result);
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
     * @dev Returns the bond address
     *
     * @return The bond address
     */
    function getBond() external view returns (address) {
        return _getBond();
    }
}
