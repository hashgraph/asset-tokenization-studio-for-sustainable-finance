// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    ILifeCycleCashFlow
} from './interfaces/ILifeCycleCashFlow.sol';
import {
    Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';
import {
    HederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';
import {
    IERC20 as OZ_IERC20
} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {
    ERC20
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/ERC1400/ERC20/ERC20.sol';
import {
    IERC1410
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC1410.sol';
import {
    IBond
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBond.sol';
import {
    ISecurity
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_3/interfaces/ISecurity.sol';
import {_DEFAULT_PARTITION} from '@hashgraph/asset-tokenization-contracts/contracts/layer_0/constants/values.sol';
import {
    LIFECYCLE_CASH_FLOW_STORAGE_POSITION
} from './constants/storagePositions.sol';

abstract contract LifeCycleCashFlowStorageWrapper is
    ILifeCycleCashFlow,
    HederaTokenService,
    AtsCommon
{
    struct LifeCycleCashFlowStorage {
        address asset;
        OZ_IERC20 paymentToken;
        mapping(uint256 => mapping(address => bool)) paidAddressesByDistribution;
        mapping(address => bool) cashOutPaidAddresses;
        bool initialized;
    }

    modifier isAsset(address asset) {
        _checkAsset(asset);
        _;
    }

    modifier onlyOnDistributionDate(address asset, uint256 distributionID) {
        _checkDistributionDate(asset, distributionID);
        _;
    }

    modifier onlyOnMaturityDate(address bond) {
        _checkMaturityDate(bond);
        _;
    }

    /*
     * @dev Pay a coupon to a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLenth The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistribution(
        address asset,
        uint256 distributionID,
        uint256 pageIndex,
        uint256 pageLength
    )
        internal
        returns (
            address[] memory failed,
            address[] memory succeeded,
            uint256[] memory paidAmount,
            bool
        )
    {
        address[] memory holders = _getHolders(
            asset,
            distributionID,
            pageIndex,
            pageLength
        );
        if (holders.length == 0)
            return (failed, succeeded, paidAmount, false);
        (failed, succeeded, paidAmount) = _executeDistributionByAddresses(
            asset,
            distributionID,
            holders
        );
        return (failed, succeeded, paidAmount, true);
    }

    /*
     * @dev Retry the payment of a coupon to a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistributionByAddresses(
        address asset,
        uint256 distributionID,
        address[] memory holders
    )
        internal
        returns (
            address[] memory failed,
            address[] memory succeeded,
            uint256[] memory paidAmount
        )
    {
        (failed, succeeded, paidAmount) = _payHoldersDistribution(
            asset,
            distributionID,
            holders
        );
    }

    /*
     * @dev Perform a bond cash out to a page of holders
     *
     * @param bond The bond the cash out belongs to
     * @param pageIndex The index of the page whose cash outs will be performed
     * @param pageLenth The number of holders who owns the bond to be cashed out
     *
     * @return The array of the holders addresses whose cashes outs were not successful
     * @return True if ATS returns holders for their bonds to be cashed out, and false otherwise
     */
    function _executeBondCashOut(
        address bond,
        uint256 pageIndex,
        uint256 pageLength
    )
        internal
        returns (
            address[] memory failed,
            address[] memory succeeded,
            uint256[] memory paidAmount,
            bool
        )
    {
        address[] memory holders = ISecurity(bond).getSecurityHolders(
            pageIndex,
            pageLength
        );

        if (holders.length == 0)
            return (failed, succeeded, paidAmount, false);
        (failed, succeeded, paidAmount) = _executeBondCashOutByAddresses(
            bond,
            holders
        );
        return (failed, succeeded, paidAmount, true);
    }

    /*
     * @dev Perform a bond cash out to a list of holders
     *
     * @param bond The bond the cash out belongs to
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose cash outs were not successful
     */
    function _executeBondCashOutByAddresses(
        address bond,
        address[] memory holders
    )
        internal
        returns (
            address[] memory failed,
            address[] memory succeeded,
            uint256[] memory paidAmount
        )
    {
        (failed, succeeded, paidAmount) = _payHoldersCashOut(
            bond,
            holders
        );
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _setAsset(address asset) internal {
        _lifeCycleCashFlowStorage().asset = asset;
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _getAsset() internal view returns (address) {
        return _lifeCycleCashFlowStorage().asset;
    }

    /*
     * @dev Checks if a distribution was already paid to a holder
     *
     * @param distributionID The coupon identifier
     * @param holder The holder to the if the distribution was already paid
     *
     * @return True if the distribution was already paid to the holder, false otherwise
     */
    function _isDistributionHolderPaid(
        uint256 distributionID,
        address holder
    ) internal view returns (bool) {
        return
            _lifeCycleCashFlowStorage().paidAddressesByDistribution[
                distributionID
            ][holder];
    }

    /*
     * @dev Get the LifeCycleCashFlow storage
     *
     * @returns The LifeCycleCashFlow storage
     */
    function _lifeCycleCashFlowStorage()
        internal
        pure
        returns (LifeCycleCashFlowStorage storage lifeCycleCashFlowStorage_)
    {
        bytes32 position = LIFECYCLE_CASH_FLOW_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lifeCycleCashFlowStorage_.slot := position
        }
    }

    /*
     * @dev Sets a payment to an array of holders for a distribution
     *
     * @param distributionID The distribution paid to a holder
     * @param holders The array of holders who were paid
     */
    function _setDistributionHoldersPaid(
        uint256 distributionID,
        address[] memory holders
    ) private {
        for (uint256 index; index < holders.length; ) {
            _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionID][
                holders[index]
            ] = true;
        }
    }

    /*
     * @dev Sets a cash out to a holder
     *
     * @param holder The holder who was cashed out
     */
    function _setHolderCashOutPaid(address holder) private {
        _lifeCycleCashFlowStorage().cashOutPaidAddresses[holder] = true;
    }

    /*
     * @dev Returns the array containing holders addresses who couldn't be paid for a distribution id
     *
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon identifier
     * @param holders The holders to be paid
     *
     * @return The array of the holders addresses whose payment were not successful for the distribution
     */
    function _payHoldersDistribution(
        address asset,
        uint256 distributionID,
        address[] memory holders
    )
        private
        returns (
            address[] memory failedAddresses,
            address[] memory succeededAddresses,
            uint256[] memory paidAmount
        )
    {
        failedAddresses = new address[](holders.length);
        succeededAddresses = new address[](holders.length);
        paidAmount = new uint256[](holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        uint256 nominalValue = IBond(asset).getBondDetails().nominalValue;
        uint256[] memory calculatedAmount = new uint256[](holders.length);
        for (uint256 index; index < holders.length; ) {
            (bool success, uint256 amount) = _getCouponAmount(
                asset,
                distributionID,
                holders[index],
                nominalValue
            );

            calculatedAmount[index] = amount;
            unchecked {
                ++index;
            }
        }

        //checkear que hay saldo suficiente
        //


        // Todo ha ido bien
        if () {
            succeededAddresses = holders;
            _setDistributionHoldersPaid(distributionID, holders);
            paidAmount = calculatedAmount;
        } else {
            failedAddresses = holders;
        }

        return (failedAddresses, succeededAddresses, paidAmount);


        /*uint256 failedIndex;
        uint256 succeededIndex;

        uint256 nominalValue = IBond(asset).getBondDetails().nominalValue;
        for (uint256 index; index < holders.length; ) {
            (bool success, uint256 amount) = _getCouponAmount(
                asset,
                distributionID,
                holders[index],
                nominalValue
            );

            if (
                !success ||
                !_payHolderDistribution(
                    distributionID,
                    holders[index],
                    amount,
                    paymentToken
                )
            ) {
                failedAddresses[failedIndex] = holders[index];
                unchecked {
                    ++failedIndex;
                }
            } else {
                succeededAddresses[succeededIndex] = holders[index];
                paidAmount[succeededIndex] = amount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
        return (failedAddresses, succeededAddresses, paidAmount);*/
    }

    /*
     * @dev Returns the array containing holders addresses who couldn't be paid for a cash out
     *
     * @param bond The bond the cash out belongs to
     * @param holders The holders to be paid
     *
     * @return The array of the holders addresses whose payment were not successful for the cash out
     */
    function _payHoldersCashOut(
        address bond,
        address[] memory holders
    )
        private
        returns (
            address[] memory failedAddresses,
            address[] memory succeededAddresses,
            uint256[] memory paidAmount
        )
    {
        failedAddresses = new address[](holders.length);
        succeededAddresses = new address[](holders.length);
        paidAmount = new uint256[](holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        uint256 failedIndex;
        uint256 succeededIndex;
        for (uint256 index; index < holders.length; ) {
            uint256 tokensAmount = _getTokensAmount(bond, holders[index]);
            uint256 cashAmount = _getCashOutAmount(bond, tokensAmount);

            if (!_payHolderCashOut(holders[index], cashAmount, paymentToken)) {
                failedAddresses[failedIndex] = holders[index];
                unchecked {
                    ++failedIndex;
                }
            } else {
                IBond(bond).redeemAtMaturityByPartition(
                    holders[index],
                    _DEFAULT_PARTITION,
                    tokensAmount
                );
                succeededAddresses[succeededIndex] = holders[index];
                paidAmount[succeededIndex] = cashAmount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
    }

    /*
     * @dev Pay an amount of USDC tokens to a holder
     *
     * @param distributionID The coupon identifier
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the distribution
     *
     * @return True if the payment succeeded, false otherwise
     */
    /*function _payHolderDistribution(
        uint256 distributionID,
        address holder,
        uint256 amount,
        OZ_IERC20 _paymentToken
    ) private returns (bool) {
        if (_isDistributionHolderPaid(distributionID, holder)) {
            return false;
        }

        if (_paymentToken.balanceOf(address(this)) < amount) {
            return false;
        }

        try _paymentToken.transfer(holder, amount) returns (bool result) {
            // If the transfer was successful, we set the holder as paid
            if (result) {
                _setDistributionHolderPaid(distributionID, holder);
            }
            return result;
        } catch {
            return false;
        }
    }*/

    /*
     * @dev Pay an amount of payment tokens to a holder
     *
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    /*function _payHolderCashOut(
        address holder,
        uint256 amount,
        OZ_IERC20 paymentToken
    ) private returns (bool) {
        if (_isHolderCashOutPaid(holder)) {
            return false;
        }

        if (paymentToken.balanceOf(address(this)) < amount) {
            return false;
        }

        try paymentToken.transfer(holder, amount) returns (bool result) {
            if (result) {
                _setHolderCashOutPaid(holder);
            }
            return result;
        } catch {
            return false;
        }
    }*/

    /*
     * @dev Get a list of holders of a coupon by page
     *
     * @param asset The asset the holders belongs to
     * @param distributionID The coupon identifier
     * @param pageIndex The index of the page
     * @param pageLenth The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getHolders(
        address asset,
        uint256 distributionID,
        uint256 pageIndex,
        uint256 pageLength
    ) private view returns (address[] memory) {
        return
            IBond(asset).getCouponHolders(
                distributionID,
                pageIndex,
                pageLength
            );
    }

    /*
     * @dev Check that the contract manages a certain asset
     *
     * @param assetAddress The address of the asset to check
     */
    function _checkAsset(address assetAddress) private view {
        if (assetAddress != _lifeCycleCashFlowStorage().asset) {
            revert InvalidAsset(assetAddress);
        }
    }

    /*
     * @dev Check if a certain holder was already cashed out
     *
     * @param holder The holder to check if the cash out was already paid
     *
     * @return True if the holder was already cashed out, false otherwise
     */
    function _isHolderCashOutPaid(
        address holder
    ) private view returns (bool) {
        return _lifeCycleCashFlowStorage().cashOutPaidAddresses[holder];
    }

    /*
     * @dev Check that today is the execution date of the distributionID
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkDistributionDate(
        address asset,
        uint256 distributionID
    ) private view {
        uint256 executionDateInit = _getDistributionExecutionDate(
            asset,
            distributionID
        );
        _checkPaymentDate(executionDateInit, _blockTimestamp());
    }

    /*
     * @dev Check that today is the maturity date of the bond
     *
     * @param bond The bond address
     */
    function _checkMaturityDate(address bond) private view {
        uint256 maturityDateInit = _getMaturityDate(bond);
        _checkPaymentDate(maturityDateInit, _blockTimestamp());
    }

    /*
     * @dev Get the amount of asset tokens of a holder
     *
     * @param asset The asset the holder's balance is requested
     * @param holder The holder whose tokens are requested
     *
     * @return The amount of tokens
     */
    function _getTokensAmount(
        address asset,
        address holder
    ) private view returns (uint256) {
        return IERC1410(asset).balanceOf(holder);
    }

    /*
     * @dev Get the coupon amount to pay for a certain holder
     *
     * @param asset The asset its coupon amount is requested
     * @param couponId The coupon identifier
     * @param holder The holder address to be paid
     * @param bondDetailsData Bond details to calculate the amount
     *
     * @return True if getting coupon for was successfully executed, false otherwise
     * @return The amount to be paid
     */
    function _getCouponAmount(
        address asset,
        uint256 couponID,
        address holder,
        uint256 nominalValue
    ) private view returns (bool success, uint256 amount) {
        try IBond(asset).getCouponFor(couponID, holder) returns (
            IBond.CouponFor memory couponFor
        ) {
            amount = ((couponFor.tokenBalance *
                nominalValue *
                (couponFor.executionDate - /*couponFor.fromDate*/ 0) * // TO BE FIXEDDDDDDDDDDDDDD
                couponFor.rate) /
                100 /
                (365 * 24 * 60 * 60) /
                10 ** couponFor.decimals);
            return (true, amount);
        } catch {
            return (false, 0);
        }
    }

    /*
     * @dev Get the cash out amount to pay for a certain holder
     *
     * @param asset The asset its cash out amount is requested
     * @param holder The holder address to be paid
     *
     * @return The amount to be paid
     */
    function _getCashOutAmount(
        address asset,
        uint256 tokensAmount
    ) private view returns (uint256) {
        IBond.BondDetailsData memory bondDetailsData = IBond(asset)
            .getBondDetails();
        uint8 bondDecimals = ERC20(asset).getERC20Metadata().info.decimals;
        return ((tokensAmount *
            bondDetailsData.nominalValue) / 10 ** bondDecimals);
    }

    /*
     * @dev Get the coupon execution date
     *
     * @param asset The asset its distribution execution date is requested
     * @param distributionID The identifier of the coupon
     *
     * @returns The coupon execution date
     */
    function _getDistributionExecutionDate(
        address asset,
        uint256 distributionID
    ) private view returns (uint256) {
        return IBond(asset).getCoupon(distributionID).coupon.executionDate;
    }

    /*
     * @dev Get the bond maturity date
     *
     * @param bond The bond its maturity date is requested
     *
     * @returns The bond maturity date
     */
    function _getMaturityDate(
        address bond
    ) private view returns (uint256) {
        return IBond(bond).getBondDetails().maturityDate;
    }

    /*
     * @dev Check that today is the payment date of a distribution or a bond
     *
     * @param initialDate The payment initialDate
     * @param currentDate The current date
     *
     * @returns True if the the current date is between the initial and the ending date
     * @returns The payment ending date
     */
    function _checkPaymentDate(
        uint256 initialDate,
        uint256 currentDate
    ) private pure {
        if (currentDate < initialDate) {
            revert NotPaymentDate(initialDate, currentDate);
        }
    }
}
