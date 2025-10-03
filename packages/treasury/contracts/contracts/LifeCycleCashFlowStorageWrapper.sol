// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {ILifeCycleCashFlow} from './interfaces/ILifeCycleCashFlow.sol';
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
import {
    _DEFAULT_PARTITION
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_0/constants/values.sol';
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

    modifier onlyOnDistributionDate(address asset, uint256 distributionId) {
        _checkDistributionDate(asset, distributionId);
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
     * @param distributionId The coupon identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLenth The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistribution(
        address asset,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    )
        internal
        returns (
            PaymentResult memory result,
            bool
        )
    {
        address[] memory holders = _getHolders(
            asset,
            distributionId,
            pageIndex,
            pageLength
        );
        if (holders.length == 0) return (result, false);
        result = _executeDistributionByAddresses(
            asset,
            distributionId,
            holders
        );
        return (result, true);
    }

    /*
     * @dev Retry the payment of a coupon to a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistributionByAddresses(
        address asset,
        uint256 distributionId,
        address[] memory holders
    )
        internal
        returns (
            PaymentResult memory result
        )
    {
        (result) = _payHoldersDistribution(
            asset,
            distributionId,
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
            PaymentResult memory result,
            bool
        )
    {
        address[] memory holders = ISecurity(bond).getSecurityHolders(
            pageIndex,
            pageLength
        );

        if (holders.length == 0) return (result, false);
        (result) = _executeBondCashOutByAddresses(
            bond,
            holders
        );
        return (result, true);
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
            PaymentResult memory result
        )
    {
        result = _payHoldersCashOut(bond, holders);
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
     * @param distributionId The coupon identifier
     * @param holder The holder to the if the distribution was already paid
     *
     * @return True if the distribution was already paid to the holder, false otherwise
     */
    function _isDistributionHolderPaid(
        uint256 distributionId,
        address holder
    ) internal view returns (bool) {
        return
            _lifeCycleCashFlowStorage().paidAddressesByDistribution[
                distributionId
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
     * @dev Check if the uint256 value can be safely converted to int64
     *
     * @param value The value to be checked
     *
     * @return True if the value can be safely converted to int64, false otherwise
     */
    function _amountFitsInInt64(uint256 value) internal pure returns (bool) {
        return value <= 9223372036854775807;
    }

    /*
     * @dev Sets a payment to an array of holders for a distribution
     *
     * @param distributionId The distribution paid to a holder
     * @param holderss The array of holders who were paid
     */
    function _setDistributionHoldersPaid(
        uint256 distributionId,
        address[] memory holders
    ) private {
        for (uint256 index; index < holders.length; ) {
            _setDistributionHolderPaid(distributionId, holders[index]);

            unchecked {
                ++index;
            }
        }
    }

    function _setDistributionHolderPaid(
        uint256 distributionId,
        address holder
    ) private {
        _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionId][
            holder
        ] = true;
    }

    /*
     * @dev Sets a cash out to an array of holders
     *
     * @param holder The array of holders who were cashed out
     */
    function _setHoldersCashOutPaid(address[] memory holders) private {
        for (uint256 index; index < holders.length; ) {
            _setHolderCashOutPaid(holders[index]);

            unchecked {
                ++index;
            }
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
     * @param distributionId The coupon identifier
     * @param holders The holders to be paid
     *
     * @return The array of the holders addresses whose payment were not successful for the distribution
     */
    function _payHoldersDistribution(
        address asset,
        uint256 distributionId,
        address[] memory holders
    )
        private
        returns (
            PaymentResult memory result
        )
    {
        result.failedAddresses = new address[](holders.length);
        result.succeededAddresses = new address[](holders.length);
        result.paidAmounts = new uint256[](holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        int64 batchTotalAmount;

        uint256 batchIndex;
        uint256 nominalValue = IBond(asset).getBondDetails().nominalValue;
        address[] memory batchHolders = new address[](holders.length);
        int64[] memory batchAmounts = new int64[](holders.length);

        for (uint256 index; index < holders.length; ) {
            if (_isHolderCashOutPaid(holders[index])) {
                uint256 indexToAdd = _firstZeroAddressIndex(result.failedAddresses);
                result.failedAddresses[indexToAdd] = holders[index];
                unchecked { ++index; }
                continue;
            }

            (bool success, uint256 amount) = _getCouponAmount(
                asset,
                distributionId,
                holders[index],
                nominalValue
            );

            if (!success) {
                uint256 indexToAdd = _firstZeroAddressIndex(result.failedAddresses);
                result.failedAddresses[indexToAdd] = holders[index];
                unchecked { ++index; }
                continue;
            }

            if (_amountFitsInInt64(amount)) {
                if (
                    _amountFitsInInt64(
                        uint256(uint64(batchTotalAmount)) + amount
                    )
                ) {
                    batchHolders[batchIndex] = holders[index];
                    batchAmounts[batchIndex] = int64(int256(amount));
                    batchTotalAmount += batchAmounts[batchIndex];
                } else {
                    // batch transfer payment
                    result = _processBatchDistribution(
                        distributionId,
                        batchHolders,
                        batchAmounts,
                        batchTotalAmount,
                        paymentToken,
                        result
                    );
                    batchHolders = new address[](holders.length);
                    batchAmounts = new int64[](holders.length);
                    batchTotalAmount = 0;
                    batchIndex = 0;
                    continue;
                }
            } else {
                // individual payment
                if (
                    _payHolderDistribution(
                        distributionId,
                        holders[index],
                        amount,
                        paymentToken
                    )
                ) {
                    uint256 succeededIndex = _firstZeroAddressIndex(
                        result.succeededAddresses
                    );
                    result.succeededAddresses[succeededIndex] = holders[index];
                    result.paidAmounts[succeededIndex] = amount;
                } else {
                    result.failedAddresses[
                        _firstZeroAddressIndex(result.failedAddresses)
                    ] = holders[index];
                }
            }

            unchecked {
                ++index;
            }
        }

        // last batch transfer payment
        if (batchHolders[0] != address(0)) {
            result = _processBatchDistribution(
                distributionId,
                batchHolders,
                batchAmounts,
                batchTotalAmount,
                paymentToken,
                result
            );
        }
        return result;
    }

    /*
     * @dev Process a batch distribution payment to a list of holders
     *
     * @param distributionId The distribution paid to a holder
     * @param batchHolders The array of holders who were paid
     * @param batchAmounts The array of amounts paid to holders
     * @param batchTotalAmount The total amount paid to holders
     * @param paymentToken The payment token used to pay the cash out
     * @param resultParams The payment result parameters to be updated
     *
     * @return The payment result updated with the batch payment results
     */
    function _processBatchDistribution(
        uint256 distributionId,
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount,
        OZ_IERC20 paymentToken,
        PaymentResult memory resultParams
    ) private returns (
        PaymentResult memory result
    ) {
        if (
            !_payBatchHoldersDistribution(
            distributionId,
            holders,
            amounts,
            totalAmount,
            paymentToken
        )
        ) {
            result.failedAddresses = _populateSourceArrayFromDataArray(
                resultParams.failedAddresses,
                holders
            );
        } else {
            (
                result.succeededAddresses,
                result.paidAmounts
            ) = _populateSourceArraysFromDataArrays(
                resultParams.succeededAddresses,
                holders,
                resultParams.paidAmounts,
                amounts
            );
        }

        return result;
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
            PaymentResult memory result
        )
    {
        result.failedAddresses = new address[](holders.length);
        result.succeededAddresses = new address[](holders.length);
        result.paidAmounts = new uint256[](holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;

        int64 batchTotalAmount;

        uint256 batchIndex;
        address[] memory batchHolders = new address[](holders.length);
        int64[] memory batchAmounts = new int64[](holders.length);
        uint256[] memory batchTokensAmount = new uint256[](holders.length);

        for (uint256 index; index < holders.length; ) {
            if (_isHolderCashOutPaid(holders[index])) {
                result.failedAddresses[
                    _firstZeroAddressIndex(result.failedAddresses)
                ] = holders[index];
                unchecked { ++index; }
                continue;
            }

            uint256 tokensAmount = _getTokensAmount(bond, holders[index]);
            uint256 cashAmount = _getCashOutAmount(bond, tokensAmount);

            if (_amountFitsInInt64(cashAmount)) {
                if (
                    _amountFitsInInt64(
                        uint256(uint64(batchTotalAmount)) + cashAmount
                    )
                ) {
                    batchHolders[batchIndex] = holders[index];
                    batchAmounts[batchIndex] = int64(int256(cashAmount));
                    batchTokensAmount[batchIndex] = tokensAmount;
                    batchTotalAmount += batchAmounts[batchIndex];
                } else {
                    // batch transfer payment
                    bool successfulPayment;
                    (successfulPayment, result) = _processBatchCashOut(
                        batchHolders,
                        batchAmounts,
                        batchTotalAmount,
                        paymentToken,
                        result
                    );
                    if (successfulPayment) {
                        _redeemBondHolders(bond, holders, batchTokensAmount);
                    }
                    batchHolders = new address[](holders.length);
                    batchAmounts = new int64[](holders.length);
                    batchTokensAmount = new uint256[](holders.length);
                    batchTotalAmount = 0;
                    batchIndex = 0;
                    continue;
                }
            } else {
                // individual payment
                if (
                    _payHolderCashOut(holders[index], cashAmount, paymentToken)
                ) {
                    uint256 succeededIndex = _firstZeroAddressIndex(
                        result.succeededAddresses
                    );
                    result.succeededAddresses[succeededIndex] = holders[index];
                    result.paidAmounts[succeededIndex] = cashAmount;
                    _redeemBondHolder(bond, holders[index], tokensAmount);
                } else {
                    result.failedAddresses[
                        _firstZeroAddressIndex(result.failedAddresses)
                    ] = holders[index];
                }
            }

            unchecked {
                ++index;
            }
        }

        // last batch transfer payment
        if (batchHolders[0] != address(0)) {
            bool successfulPayment;
            (successfulPayment, result) = _processBatchCashOut(
                batchHolders,
                batchAmounts,
                batchTotalAmount,
                paymentToken,
                result
            );
            if (successfulPayment) {
                _redeemBondHolders(bond, holders, batchTokensAmount);
            }
        }
        return result;
    }

    /*
     * @dev Process a batch cash out payment to a list of holders
     *
     * @param distributionId The distribution paid to a holder
     * @param batchHolders The array of holders who were paid
     * @param batchAmounts The array of amounts paid to holders
     * @param batchTotalAmount The total amount paid to holders
     * @param paymentToken The payment token used to pay the cash out
     * @param resultParams The payment result parameters to be updated
     *
     * @return The payment result updated with the batch payment results
     */
    function _processBatchCashOut(
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount,
        OZ_IERC20 paymentToken,
        PaymentResult memory resultParams
    ) private returns (
        bool successfulPayment,
        PaymentResult memory result
    ) {
        result = resultParams;

        if (
            !_payBatchHoldersCashOut(
            holders,
            amounts,
            totalAmount,
            paymentToken
        )
        ) {
            result.failedAddresses = _populateSourceArrayFromDataArray(
                result.failedAddresses,
                holders
            );
            return (false, result);
        } else {
            (
                result.succeededAddresses,
                result.paidAmounts
            ) = _populateSourceArraysFromDataArrays(
                result.succeededAddresses,
                holders,
                result.paidAmounts,
                amounts
            );
            return (true, result);
        }
    }

    /*
     * @dev Redeem the bond tokens of a list of holders
     *
     * @param bond The bond the cash out belongs to
     * @param holders The holders whose bonds will be redeemed
     * @param tokensAmounts The amounts of tokens to be redeemed for each holder
     */
    function _redeemBondHolders(
        address bond,
        address[] memory holders,
        uint256[] memory tokensAmounts
    ) private {
        for (uint256 index; index < holders.length; ) {
            _redeemBondHolder(bond, holders[index], tokensAmounts[index]);

            unchecked {
                ++index;
            }
        }
    }

    /*
     * @dev Redeem the bond tokens of a holder
     *
     * @param bond The bond the cash out belongs to
     * @param holder The holder whose bonds will be redeemed
     * @param tokensAmount The amount of tokens to be redeemed for the holder
     */
    function _redeemBondHolder(
        address bond,
        address holder,
        uint256 tokensAmount
    ) private {
        IBond(bond).redeemAtMaturityByPartition(
            holder,
            _DEFAULT_PARTITION,
            tokensAmount
        );
    }

    /*
     * @dev Pay an amount of payment tokens to a holder
     *
     * @param distributionId The distribution paid to a holder
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @param totalAmount The total amount to be paid to the holders
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payBatchHoldersDistribution(
        uint256 distributionId,
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount,
        OZ_IERC20 paymentToken
    ) private returns (bool) {
        if (
            transferTokens(
                address(paymentToken),
                _createTransferAccounts(holders, address(this)),
                _createTransferAmounts(amounts, -totalAmount)
            ) != 22
        ) {
            _setDistributionHoldersPaid(distributionId, holders);

            return true;
        }
        return false;
    }

    /*
     * @dev Pay an amount of USDC tokens to a holder
     *
     * @param distributionId The coupon identifier
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the distribution
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payHolderDistribution(
        uint256 distributionId,
        address holder,
        uint256 amount,
        OZ_IERC20 paymentToken
    ) private returns (bool) {
        if (_isDistributionHolderPaid(distributionId, holder)) {
            return false;
        }

        if (paymentToken.balanceOf(address(this)) < amount) {
            return false;
        }

        try paymentToken.transfer(holder, amount) returns (bool result) {
            if (result) {
                _setDistributionHolderPaid(distributionId, holder);
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
     * @param totalAmount The total amount to be paid to the holders
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payBatchHoldersCashOut(
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount,
        OZ_IERC20 paymentToken
    ) private returns (bool) {
        if (
            transferTokens(
                address(paymentToken),
                _createTransferAccounts(holders, address(this)),
                _createTransferAmounts(amounts, -totalAmount)
            ) != 22
        ) {
            _setHoldersCashOutPaid(holders);

            return true;
        }
        return false;
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
    }

    /*
     * @dev Get a list of holders of a coupon by page
     *
     * @param asset The asset the holders belongs to
     * @param distributionId The coupon identifier
     * @param pageIndex The index of the page
     * @param pageLenth The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getHolders(
        address asset,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    ) private view returns (address[] memory) {
        return
            IBond(asset).getCouponHolders(
                distributionId,
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
    function _isHolderCashOutPaid(address holder) private view returns (bool) {
        return _lifeCycleCashFlowStorage().cashOutPaidAddresses[holder];
    }

    /*
     * @dev Check that today is the execution date of the distributionId
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkDistributionDate(
        address asset,
        uint256 distributionId
    ) private view {
        uint256 executionDateInit = _getDistributionExecutionDate(
            asset,
            distributionId
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
        uint256 couponId,
        address holder,
        uint256 nominalValue
    ) private view returns (bool success, uint256 amount) {
        try IBond(asset).getCouponFor(couponId, holder) returns (
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
        return ((tokensAmount * bondDetailsData.nominalValue) /
            10 ** bondDecimals);
    }

    /*
     * @dev Get the coupon execution date
     *
     * @param asset The asset its distribution execution date is requested
     * @param distributionId The identifier of the coupon
     *
     * @returns The coupon execution date
     */
    function _getDistributionExecutionDate(
        address asset,
        uint256 distributionId
    ) private view returns (uint256) {
        return IBond(asset).getCoupon(distributionId).coupon.executionDate;
    }

    /*
     * @dev Get the bond maturity date
     *
     * @param bond The bond its maturity date is requested
     *
     * @returns The bond maturity date
     */
    function _getMaturityDate(address bond) private view returns (uint256) {
        return IBond(bond).getBondDetails().maturityDate;
    }

    /*
     * @dev Returns the first index of an address array that contains address(0)
     *
     * @param arr The array to be checked
     *
     * @return The index of the first address(0) found, or 0 if none is found
     */
    function _populateSourceArraysFromDataArrays(
        address[] memory sourceAddressArray,
        address[] memory dataAddressArray,
        uint256[] memory sourceUint256Array,
        int64[] memory dataInt64Array
    )
        private
        pure
        returns (
            address[] memory resultAddressArray,
            uint256[] memory resultUint256Array
        )
    {
        uint256 initialIndex = _firstZeroAddressIndex(sourceAddressArray);
        for (uint256 index; index < dataAddressArray.length; ) {
            sourceAddressArray[index + initialIndex] = dataAddressArray[index];
            sourceUint256Array[index + initialIndex] = uint256(
                uint64(dataInt64Array[index])
            );

            unchecked {
                ++index;
            }
        }
        resultAddressArray = sourceAddressArray;
        resultUint256Array = sourceUint256Array;
    }

    /*
     * @dev Returns the first index of an address array that contains address(0)
     *
     * @param arr The array to be checked
     *
     * @return The index of the first address(0) found, or 0 if none is found
     */
    function _populateSourceArrayFromDataArray(
        address[] memory sourceAddressArray,
        address[] memory dataAddressArray
    ) private pure returns (address[] memory resultArray) {
        uint256 initialIndex = _firstZeroAddressIndex(sourceAddressArray);
        for (uint256 index; index < dataAddressArray.length; ) {
            sourceAddressArray[index + initialIndex] = dataAddressArray[index];

            unchecked {
                ++index;
            }
        }
        resultArray = sourceAddressArray;
    }

    /*
     * @dev Returns the first index of an address array that contains address(0)
     *
     * @param arr The array to be checked
     *
     * @return The index of the first address(0) found, or 0 if none is found
     */
    function _firstZeroAddressIndex(
        address[] memory arr
    ) private pure returns (uint256) {
        for (uint256 index; index < arr.length; ) {
            if (arr[index] == address(0)) {
                return index;
            }

            unchecked {
                ++index;
            }
        }
        return 0;
    }

    /*
     * @dev Creates an array of addresses by adding a value at the end of another array
     *
     * @param arr The original array
     * @param val The value to be added at the end of the array
     *
     * @return The new array
     */
    function _createTransferAccounts(
        address[] memory arr,
        address val
    ) private pure returns (address[] memory newArr) {
        newArr = new address[](arr.length + 1);
        for (uint256 i; i < arr.length; i++) newArr[i] = arr[i];
        newArr[arr.length] = val;
    }

    /*
     * @dev Creates an array of int64 by adding a value at the end of another array
     *
     * @param arr The original array
     * @param val The value to be added at the end of the array
     *
     * @return The new array
     */
    function _createTransferAmounts(
        int64[] memory arr,
        int64 val
    ) private pure returns (int64[] memory newArr) {
        newArr = new int64[](arr.length + 1);
        for (uint256 i; i < arr.length; i++) newArr[i] = arr[i];
        newArr[arr.length] = val;
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
