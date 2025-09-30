// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    ILifeCycleCashFlowStorageWrapper
} from './interfaces/ILifeCycleCashFlowStorageWrapper.sol';
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
import {_DEFAULT_PARTITION} from './constants/values.sol';
import {
    _LIFECYCLE_CASH_FLOW_STORAGE_POSITION
} from './constants/storagePositions.sol';

abstract contract LifeCycleCashFlowStorageWrapper is
    ILifeCycleCashFlowStorageWrapper,
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

    modifier isAsset(address _asset) {
        _checkAsset(_asset);
        _;
    }

    modifier onlyOnDistributionDate(address _asset, uint256 _distributionID) {
        _checkDistributionDate(_asset, _distributionID);
        _;
    }

    modifier onlyOnMaturityDate(address _bond) {
        _checkMaturityDate(_bond);
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
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_,
            bool
        )
    {
        address[] memory holders = _getHolders(
            _asset,
            _distributionID,
            _pageIndex,
            _pageLength
        );
        if (holders.length == 0)
            return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeDistributionByAddresses(
            _asset,
            _distributionID,
            holders
        );
        return (failed_, succeeded_, paidAmount_, true);
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
        address _asset,
        uint256 _distributionID,
        address[] memory _holders
    )
        internal
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_
        )
    {
        (failed_, succeeded_, paidAmount_) = _payHoldersDistribution(
            _asset,
            _distributionID,
            _holders
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
        address _bond,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_,
            bool
        )
    {
        address[] memory holders = ISecurity(_bond).getSecurityHolders(
            _pageIndex,
            _pageLength
        );

        if (holders.length == 0)
            return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeBondCashOutByAddresses(
            _bond,
            holders
        );
        return (failed_, succeeded_, paidAmount_, true);
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
        address _bond,
        address[] memory _holders
    )
        internal
        returns (
            address[] memory failed_,
            address[] memory succeeded_,
            uint256[] memory paidAmount_
        )
    {
        (failed_, succeeded_, paidAmount_) = _payHoldersCashOut(
            _bond,
            _holders
        );
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _setAsset(address _asset) internal {
        _lifeCycleCashFlowStorage().asset = _asset;
    }

    /*
     * @dev Associate with payment token to the contract
     *
     * @param token The address of the token we want to associate with the contract
     */
    function _associateToken(address _token) internal virtual {
        if (HederaTokenService.associateToken(address(this), _token) != 22) {
            revert AssociateTokenFailed();
        }

        emit TokenAssociated(_token);
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _getAsset() internal view returns (address asset_) {
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
        uint256 _distributionID,
        address _holder
    ) internal view returns (bool) {
        return
            _lifeCycleCashFlowStorage().paidAddressesByDistribution[
                _distributionID
            ][_holder];
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
        bytes32 position = _LIFECYCLE_CASH_FLOW_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lifeCycleCashFlowStorage_.slot := position
        }
    }

    /*
     * @dev Sets a payment to a holder for a distribution
     *
     * @param distributionID The distribution paid to a holder
     * @param holder The holder who was paid
     */
    function _setDistributionHolderPaid(
        uint256 distributionID,
        address holder
    ) private {
        _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionID][
            holder
        ] = true;
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
        address _asset,
        uint256 _distributionID,
        address[] memory _holders
    )
        private
        returns (
            address[] memory failedAddresses_,
            address[] memory succeededAddresses_,
            uint256[] memory paidAmount_
        )
    {
        failedAddresses_ = new address[](_holders.length);
        succeededAddresses_ = new address[](_holders.length);
        paidAmount_ = new uint256[](_holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        uint256 failedIndex;
        uint256 succeededIndex;

        uint256 nominalValue = IBond(_asset).getBondDetails().nominalValue;
        for (uint256 index; index < _holders.length; ) {
            (bool success, uint256 amount) = _getCouponAmount(
                _asset,
                _distributionID,
                _holders[index],
                nominalValue
            );

            if (
                !success ||
                !_payHolderDistribution(
                    _distributionID,
                    _holders[index],
                    amount,
                    paymentToken
                )
            ) {
                failedAddresses_[failedIndex] = _holders[index];
                unchecked {
                    ++failedIndex;
                }
            } else {
                succeededAddresses_[succeededIndex] = _holders[index];
                paidAmount_[succeededIndex] = amount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
        return (failedAddresses_, succeededAddresses_, paidAmount_);
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
        address _bond,
        address[] memory _holders
    )
        private
        returns (
            address[] memory failedAddresses_,
            address[] memory succeededAddresses_,
            uint256[] memory paidAmount_
        )
    {
        failedAddresses_ = new address[](_holders.length);
        succeededAddresses_ = new address[](_holders.length);
        paidAmount_ = new uint256[](_holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        uint256 failedIndex;
        uint256 succeededIndex;
        for (uint256 index; index < _holders.length; ) {
            uint256 cashAmount = _getCashOutAmount(_bond, _holders[index]);

            if (!_payHolderCashOut(_holders[index], cashAmount, paymentToken)) {
                failedAddresses_[failedIndex] = _holders[index];
                unchecked {
                    ++failedIndex;
                }
            } else {
                uint256 tokensAmount = _getTokensAmount(_bond, _holders[index]);
                IBond(_bond).redeemAtMaturityByPartition(
                    _holders[index],
                    _DEFAULT_PARTITION,
                    tokensAmount
                );
                succeededAddresses_[succeededIndex] = _holders[index];
                paidAmount_[succeededIndex] = cashAmount;
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
    function _payHolderDistribution(
        uint256 _distributionID,
        address _holder,
        uint256 _amount,
        OZ_IERC20 _paymentToken
    ) private returns (bool) {
        if (_isDistributionHolderPaid(_distributionID, _holder)) {
            return false;
        }

        if (_paymentToken.balanceOf(address(this)) < _amount) {
            return false;
        }

        try _paymentToken.transfer(_holder, _amount) returns (bool result) {
            // If the transfer was successful, we set the holder as paid
            if (result) {
                _setDistributionHolderPaid(_distributionID, _holder);
            }
            return result;
        } catch {
            return false;
        }
    }

    /*
     * @dev Pay an amount of payment tokens to a holder
     *
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payHolderCashOut(
        address _holder,
        uint256 _amount,
        OZ_IERC20 _paymentToken
    ) private returns (bool) {
        if (_isHolderCashOutPaid(_holder)) {
            return false;
        }

        if (_paymentToken.balanceOf(address(this)) < _amount) {
            return false;
        }

        try _paymentToken.transfer(_holder, _amount) returns (bool result) {
            if (result) {
                _setHolderCashOutPaid(_holder);
            }
            return result;
        } catch {
            return false;
        }
    }

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
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private view returns (address[] memory holders_) {
        return
            IBond(_asset).getCouponHolders(
                _distributionID,
                _pageIndex,
                _pageLength
            );
    }

    /*
     * @dev Check that the contract manages a certain asset
     *
     * @param assetAddress The address of the asset to check
     */
    function _checkAsset(address _assetAddress) private view {
        if (_assetAddress != _lifeCycleCashFlowStorage().asset) {
            revert InvalidAsset(_assetAddress);
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
    ) private view returns (bool paid) {
        return _lifeCycleCashFlowStorage().cashOutPaidAddresses[holder];
    }

    /*
     * @dev Check that today is the execution date of the distributionID
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkDistributionDate(
        address _asset,
        uint256 _distributionID
    ) private view {
        uint256 executionDateInit = _getDistributionExecutionDate(
            _asset,
            _distributionID
        );
        _checkPaymentDate(executionDateInit, _blockTimestamp());
    }

    /*
     * @dev Check that today is the maturity date of the bond
     *
     * @param bond The bond address
     */
    function _checkMaturityDate(address _bond) private view {
        uint256 maturityDateInit = IBond(_bond).getBondDetails().maturityDate;
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
        address _asset,
        address _holder
    ) private view returns (uint256) {
        return IERC1410(_asset).balanceOf(_holder);
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
        address _asset,
        uint256 _couponID,
        address _holder,
        uint256 _nominalValue
    ) private view returns (bool success, uint256 amount) {
        try IBond(_asset).getCouponFor(_couponID, _holder) returns (
            IBond.CouponFor memory couponFor
        ) {
            amount = ((couponFor.tokenBalance *
                _nominalValue *
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
        address _asset,
        address _holder
    ) private view returns (uint256) {
        IBond.BondDetailsData memory bondDetailsData = IBond(_asset)
            .getBondDetails();
        uint8 bondDecimals = ERC20(_asset).getERC20Metadata().info.decimals;
        return ((IERC1410(_asset).balanceOf(_holder) *
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
        address _asset,
        uint256 _distributionID
    ) private view returns (uint256) {
        return IBond(_asset).getCoupon(_distributionID).coupon.executionDate;
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
        uint256 _initialDate,
        uint256 _currentDate
    ) private pure {
        if (_currentDate < _initialDate) {
            revert NotPaymentDate(_initialDate, _currentDate);
        }
    }
}
