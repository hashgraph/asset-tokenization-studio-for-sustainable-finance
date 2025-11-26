// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import { ILifeCycleCashFlow } from "../../interfaces/ILifeCycleCashFlow.sol";
import { LifeCycleCashFlowStorageWrapper } from "./LifeCycleCashFlowStorageWrapper.sol";
import { PAYOUT_ROLE, REDEMPTION_ROLE, PAUSER_ROLE } from "../../constants/roles.sol";

abstract contract LifeCycleCashFlow is ILifeCycleCashFlow, LifeCycleCashFlowStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LifeCycleCashFlow(
        address asset
    ) external override checkAddress(asset) onlyUninitialized(_lifeCycleCashFlowStorage().initialized) {
        LifeCycleCashFlowStorage storage lifeCycleCashFlowStorage = _lifeCycleCashFlowStorage();
        _setAsset(asset);
        lifeCycleCashFlowStorage.initialized = true;
    }

    /*
     * @dev Pay a distribution or dividend to a page of holders
     *
     * @param asset The address of the asset that the distribution belongs to
     * @param distributionId The distribution identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     *
     * @return An array of holders containing:
     *         - The address of the holder
     *         - The holder's payment status (SUCCEEDED, FAILED, ALREADY_PAID)
     *         - The paid amount if the status was SUCCEEDED, otherwise zero
     * @return True if ATS returned the holders to be paid, and false otherwise
     */
    function executeDistribution(
        address asset,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        checkAddress(asset)
        isAsset(asset)
        onlyOnDistributionDate(asset, distributionId)
        returns (PaymentResult[] memory results, bool executed)
    {
        (results, executed) = _executeDistribution(asset, distributionId, pageIndex, pageLength);

        emit DistributionExecuted(distributionId, pageIndex, pageLength, results);
    }

    /*
     * @dev Retry the payment of a distribution or dividend to a list of holders
     *
     * @param asset The address of the asset that the distribution belongs to
     * @param distributionId The distribution identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return An array of holders containing:
     *         - The address of the holder
     *         - The holder's payment status (SUCCEEDED, FAILED, ALREADY_PAID)
     *         - The paid amount if the status was SUCCEEDED, otherwise zero
     */
    function executeDistributionByAddresses(
        address asset,
        uint256 distributionId,
        address[] calldata holders
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        checkAddress(asset)
        isAsset(asset)
        onlyOnDistributionDate(asset, distributionId)
        returns (PaymentResult[] memory results)
    {
        results = _executeDistributionByAddresses(asset, distributionId, holders);

        emit DistributionByAddressesExecuted(distributionId, holders, results);
    }

    /*
     * @dev Perform a bond redemption to a page of holders
     *
     * @param bond The address of the bond for the redemption to be performed
     * @param pageIndex The index of the page whose redemptions will be performed
     * @param pageLength The number of holders who owns the bond to be redeemed
     *
     * @return An array of holders containing:
     *         - The address of the holder
     *         - The holder's payment status (SUCCEEDED, FAILED, ALREADY_PAID)
     *         - The paid amount if the status was SUCCEEDED, otherwise zero
     * @return True if ATS returned the holders for their bonds to be redeemed, and false otherwise
     */
    function executeBondRedemption(
        address bond,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        checkAddress(bond)
        isAsset(bond)
        onlyOnRedemptionDate(bond)
        returns (PaymentResult[] memory results, bool executed)
    {
        (results, executed) = _executeBondRedemption(bond, pageIndex, pageLength);

        emit RedemptionExecuted(pageIndex, pageLength, results);
    }

    /*
     * @dev Perform a bond redemption to a list of holders
     *
     * @param bond The address of the bond for the redemption to be performed
     * @param holders The array of holders addresses who will be paid
     *
     * @return An array of holders containing:
     *         - The address of the holder
     *         - The holder's payment status (SUCCEEDED, FAILED, ALREADY_PAID)
     *         - The paid amount if the status was SUCCEEDED, otherwise zero
     */
    function executeBondRedemptionByAddresses(
        address bond,
        address[] calldata holders
    )
        external
        override
        onlyUnpaused
        onlyRole(PAYOUT_ROLE)
        checkAddress(bond)
        isAsset(bond)
        onlyOnRedemptionDate(bond)
        returns (PaymentResult[] memory results)
    {
        results = _executeBondRedemptionByAddresses(bond, holders);

        emit RedemptionByAddressesExecuted(holders, results);
    }

    /*
     * @dev Returns the asset address
     *
     * @return The asset address
     */
    function getAsset() external view override returns (address) {
        return _getAsset();
    }
}
