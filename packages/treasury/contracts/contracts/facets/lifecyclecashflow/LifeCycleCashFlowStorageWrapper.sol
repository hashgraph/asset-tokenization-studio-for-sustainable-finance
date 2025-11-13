// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import {
    ILifeCycleCashFlow
} from '../../interfaces/ILifeCycleCashFlow.sol';
import {
    PortfolioStorageWrapper
} from '../portfolio/PortfolioStorageWrapper.sol';
import {
    LIFECYCLE_CASH_FLOW_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {
    PortfolioStorageWrapper
} from '../portfolio/PortfolioStorageWrapper.sol';
import {
    Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';
import {
    IBond
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBond.sol';
import {
    TRexIBondRead as IBondRead
} from "@hashgraph/asset-tokenization-contracts/contracts/factory/ERC3643/interfaces/IBondRead.sol";
import { IERC1410 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC1410.sol";
import {
    IERC1410Read
} from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC1410Read.sol";
import { ERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/ERC1400/ERC20/ERC20.sol";
import { ISecurity } from "@hashgraph/asset-tokenization-contracts/contracts/layer_3/interfaces/ISecurity.sol";
import {
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import {
    IHederaTokenService
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";

abstract contract LifeCycleCashFlowStorageWrapper is
    AtsCommon,
    PortfolioStorageWrapper
{
    struct LifeCycleCashFlowStorage {
        address asset;
        mapping(uint256 => mapping(address => bool)) paidAddressesByDistribution;
        bool initialized;
    }

    struct PayingArraysIndexes {
        uint256 batchIndex;
        uint256 failedAddressesIndex;
        uint256 succeededAddressesIndex;
        uint256 alreadyPaidAddressesIndex;
    }

    struct BatchInfo {
        address[] holders;
        int64[] amounts;
        int64 totalAmount;
    }

    modifier isAsset(address asset) {
        _checkAsset(asset);
        _;
    }

    modifier onlyOnDistributionDate(address asset, uint256 distributionId) {
        _checkDistributionDate(asset, distributionId);
        _;
    }

    modifier onlyOnRedemptionDate(address bond) {
        _checkRedemptionDate(bond);
        _;
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
     * @dev Pay a distribution to a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The distribution identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     * @return True if ATS returns holders for their bonds to be redeemed, and false otherwise
     */
    function _executeDistribution(
        address asset,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal returns (ILifeCycleCashFlow.DistributionPaymentResult memory result, bool) {
        address[] memory holders = _getDistributionHolders(
            asset,
            distributionId,
            pageIndex,
            pageLength
        );
        if (holders.length == 0) return (result, false);
        result = _executeDistributionByAddresses(asset, distributionId, holders);
        return (result, true);
    }

    /*
     * @dev Retry the payment of a distribution to a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The distribution identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     */
    function _executeDistributionByAddresses(
        address asset,
        uint256 distributionId,
        address[] memory holders
    ) internal returns (ILifeCycleCashFlow.DistributionPaymentResult memory result) {
        result = _payHoldersDistribution(asset, distributionId, holders);
    }

    /*
     * @dev Perform a bond redemption to a page of holders
     *
     * @param bond The bond the redemption belongs to
     * @param pageIndex The index of the page of holders whose redemptions will be performed
     * @param pageLength The number of holders who own the bond to be redeemed
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     * @return True if ATS returns holders for their bonds to be redeemed, and false otherwise
     */
    function _executeBondRedemption(
        address bond,
        uint256 pageIndex,
        uint256 pageLength
    ) internal returns (ILifeCycleCashFlow.RedemptionPaymentResult memory result, bool) {
        address[] memory holders = _getAssetHolders(
            bond,
            pageIndex,
            pageLength
        );

        if (holders.length == 0) return (result, false);
        result = _executeBondRedemptionByAddresses(bond, holders);
        return (result, true);
    }

    /*
     * @dev Perform a bond redemption to a list of holders
     *
     * @param bond The bond the redemption belongs to
     * @param holders The array of holders addresses who will be paid
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     */
    function _executeBondRedemptionByAddresses(
        address bond,
        address[] memory holders
    ) internal returns (ILifeCycleCashFlow.RedemptionPaymentResult memory result) {
        result = _payHoldersRedemption(bond, holders);
    }

    /*
     * @dev Check if the uint256 value can be safely converted to int64
     *
     * @param value The value to be checked
     *
     * @return True if the value can be safely converted to int64, false otherwise
     */
    function _valueFitsInInt64(uint256 value) internal pure returns (bool) {
        return value <= uint256(uint64(type(int64).max));
    }

    /*
     * @dev Check if the int32 value can be safely converted to uint8
     *
     * @param value The value to be checked
     *
     * @return True if the value can be safely converted to uint8, false otherwise
     */
    function _valueFitsInUint8(int32 value) internal pure returns (bool) {
        if (value < 0) return false;
        return uint32(value) <= type(uint8).max;
    }

    /*
     * @dev Pay an asset distribution for a list of holders
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The distribution identifier
     * @param holders The holders to be paid
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     */
    function _payHoldersDistribution(
        address asset,
        uint256 distributionId,
        address[] memory holders
    ) private returns (ILifeCycleCashFlow.DistributionPaymentResult memory result) {
        result.failedAddresses = new address[](holders.length);
        result.succeededAddresses = new address[](holders.length);
        result.paidAmounts = new uint256[](holders.length);
        result.alreadyPaidAddresses = new address[](holders.length);

        if (holders.length > 0) {
            PayingArraysIndexes memory payingArraysIndexes;
            BatchInfo memory batchInfo;
            batchInfo.holders = new address[](holders.length);
            batchInfo.amounts = new int64[](holders.length);
            uint256 nominalValue = _getNominalValue(asset);
            address paymentToken = _getPaymentToken();

            for (uint256 index; index < holders.length; ) {
                address holder = holders[index];
                if (!_isHolderValid(holder)) {
                    result.failedAddresses[payingArraysIndexes.failedAddressesIndex] = holder;
                    unchecked {
                        ++payingArraysIndexes.failedAddressesIndex;
                        ++index;
                    }
                    continue;
                }

                if (_isDistributionHolderPaid(distributionId, holder)) {
                    result.alreadyPaidAddresses[payingArraysIndexes.alreadyPaidAddressesIndex] = holder;
                    unchecked {
                        ++payingArraysIndexes.alreadyPaidAddressesIndex;
                        ++index;
                    }
                    continue;
                }

                uint256 amount = _getDistributionAmount(
                    asset,
                    distributionId,
                    holder,
                    nominalValue,
                    paymentToken
                );

                if (!_isValidAmount(amount)) {
                    result.failedAddresses[
                        payingArraysIndexes.failedAddressesIndex
                    ] = holder;
                    unchecked {
                        ++payingArraysIndexes.failedAddressesIndex;
                        ++index;
                    }
                    continue;
                }

                if (!_valueFitsInInt64(uint256(uint64(batchInfo.totalAmount)) + amount)) {
                    // batch transfer payment
                    uint256 succeededResults;
                    uint256 failedResults;
                    (succeededResults, failedResults) = _processBatchDistribution(
                        distributionId,
                        paymentToken,
                        batchInfo,
                        payingArraysIndexes,
                        result
                    );
                    payingArraysIndexes.succeededAddressesIndex += succeededResults;
                    payingArraysIndexes.failedAddressesIndex += failedResults;

                    batchInfo.holders = new address[](holders.length);
                    batchInfo.amounts = new int64[](holders.length);
                    batchInfo.totalAmount = 0;
                    payingArraysIndexes.batchIndex = 0;
                }
                batchInfo.holders[payingArraysIndexes.batchIndex] = holder;
                batchInfo.amounts[payingArraysIndexes.batchIndex] = int64(int256(amount));
                batchInfo.totalAmount += batchInfo.amounts[payingArraysIndexes.batchIndex];
                unchecked {
                    ++payingArraysIndexes.batchIndex;
                    ++index;
                }
            }

            // last batch transfer payment
            if (batchInfo.holders[0] != address(0)) {
                _processBatchDistribution(distributionId, paymentToken, batchInfo, payingArraysIndexes, result);
            }
        }
    }

    /*
     * @dev Check if a holder address is valid
     *
     * @param holder The holder address to be checked
     *
     * @return True if the holder address is valid, false otherwise
     */
    function _isHolderValid(address holder) private pure returns (bool) {
        return holder != address(0);
    }

    /*
     * @dev Get the distribution amount to pay for a certain holder
     *
     * @param asset The asset its distribution amount is requested
     * @param distributionId The distribution identifier
     * @param holder The holder address to be paid
     * @param nominalValue The nominal value of the asset
     * @param bondDetailsData Bond details to calculate the amount
     *
     * @return True if getting distribution for was successfully executed, false otherwise
     * @return The amount to be paid
     */
    function _getDistributionAmount(
        address asset,
        uint256 distributionId,
        address holder,
        uint256 nominalValue,
        address paymentToken
    ) private returns (uint256 amount) {
        IBondRead.CouponFor memory couponFor = IBondRead(asset).getCouponFor(
            distributionId,
            holder
        );
        uint8 paymentTokenDecimals = _getPaymentTokenDecimals(paymentToken);
        uint256 scaleDown = couponFor.decimals + couponFor.rateDecimals;
        uint256 scaleUp = paymentTokenDecimals;
        amount = (((couponFor.tokenBalance *
            nominalValue *
            couponFor.period *
            couponFor.rate) /
            100 /
            (365 * 24 * 60 * 60) /
            10 ** scaleDown) * 10 ** scaleUp);
    }

    /*
     * @dev Get the redemption amount to pay for a certain holder
     *
     * @param bond The bond its redemption amount is requested
     * @param holder The holder address to be paid
     *
     * @return The amount to be paid
     */
    function _getRedemptionAmount(
        address bond,
        uint256 tokensAmount,
        uint256 nominalValue,
        address paymentToken
    ) private returns (uint256 amount) {
        uint8 paymentTokenDecimals = _getPaymentTokenDecimals(paymentToken);
        uint8 bondDecimals = _getAssetDecimals(bond);
        uint8 nominalValueDecimals = bondDecimals;
        uint256 scaleDown = bondDecimals + nominalValueDecimals;
        amount = (((tokensAmount * nominalValue) / 10 ** scaleDown) * 10 ** paymentTokenDecimals);
    }

    /**
     * @dev Get the asset decimals
     *
     * @param asset The asset address
     *
     * @return decimals The asset decimals
     */
    function _getAssetDecimals(address asset) private view returns (uint8) {
        try ERC20(asset).decimals() returns (uint8) {
            return ERC20(asset).decimals();
        } catch {
            revert ILifeCycleCashFlow.GetAssetDecimalsFailed(asset);
        }
    }

    /**
     * @dev Get the payment token decimals
     *
     * @param token The payment token address
     *
     * @return decimals The payment token decimals
     */
    function _getPaymentTokenDecimals(address token) private returns (uint8) {
        (int256 responseCode, IHederaTokenService.FungibleTokenInfo memory info) = getFungibleTokenInfo(token);
        if (responseCode == HederaResponseCodes.SUCCESS) {
            if (_valueFitsInUint8(info.decimals)) {
                return uint8(uint32(info.decimals));
            }
            revert ILifeCycleCashFlow.InvalidTokenDecimals(token, info.decimals);
        }
        revert ILifeCycleCashFlow.GetTokenDecimalsFailed(token, responseCode);
    }

    /*
     * @dev Get the nominal value of the asset
     *
     * @param asset The asset address
     *
     * @return The nominal value of the asset
     */
    function _getNominalValue(address asset) private view returns (uint256 nominalValue) {
        try IBondRead(asset).getBondDetails() returns (IBondRead.BondDetailsData memory bondDetailsData) {
            return bondDetailsData.nominalValue;
        } catch {
            revert ILifeCycleCashFlow.AssetNominalValueError(asset);
        }
    }

    /*
     * @dev Process a batch distribution payment to a list of holders
     *
     * @param distributionId The distribution paid to a holder
     * @param batchHolders The array of holders who were paid
     * @param batchAmounts The array of amounts paid to holders
     * @param batchTotalAmount The total amount paid to holders
     * @param resultParams The payment result parameters to be updated
     *
     * @return The payment result updated with the batch payment results
     */
    function _processBatchDistribution(
        uint256 distributionId,
        address paymentToken,
        BatchInfo memory batchInfo,
        PayingArraysIndexes memory payingArraysIndexes,
        ILifeCycleCashFlow.DistributionPaymentResult memory result
    ) private returns (uint256 succeededResults, uint256 failedResults) {
        if (
            _payBatchHoldersDistribution(
                distributionId,
                paymentToken,
                batchInfo.holders,
                batchInfo.amounts,
                batchInfo.totalAmount
            )
        ) {
            (result.succeededAddresses, result.paidAmounts) = _populateSourceArraysFromDataArrays(
                result.succeededAddresses,
                payingArraysIndexes.succeededAddressesIndex,
                batchInfo.holders,
                result.paidAmounts,
                batchInfo.amounts
            );
            return (result.succeededAddresses.length, 0);
        } else {
            result.failedAddresses = _populateSourceArrayFromDataArray(
                result.failedAddresses,
                payingArraysIndexes.failedAddressesIndex,
                batchInfo.holders
            );
            return (0, result.failedAddresses.length);
        }
    }

    /*
     * @dev Pay a bond redemption for a list of holders
     *
     * @param bond The bond the redemption belongs to
     * @param holders The holders to be paid
     *
     * @return An struct containing:
     *         - The array of the holders addresses whose redemptions were not successful
     *         - The array of the holders addresses whose payment were successful
     *         - The array of the holders addresses who were already paid
     *         - The array of the amounts paid to holders
     */
    function _payHoldersRedemption(
        address bond,
        address[] memory holders
    ) private returns (ILifeCycleCashFlow.RedemptionPaymentResult memory result) {
        result.failedAddresses = new address[](holders.length);
        result.succeededAddresses = new address[](holders.length);
        result.paidAmounts = new uint256[](holders.length);

        if (holders.length > 0) {
            PayingArraysIndexes memory payingArraysIndexes;
            BatchInfo memory batchInfo;
            batchInfo.holders = new address[](holders.length);
            batchInfo.amounts = new int64[](holders.length);
            uint256 nominalValue = _getNominalValue(bond);

            address paymentToken = _getPaymentToken();

            for (uint256 index; index < holders.length; ) {
                address holder = holders[index];
                if (!_isHolderValid(holder)) {
                    result.failedAddresses[payingArraysIndexes.failedAddressesIndex] = holder;
                    unchecked {
                        ++payingArraysIndexes.failedAddressesIndex;
                        ++index;
                    }
                    continue;
                }

                uint256 tokensAmount = _getTokensAmount(bond, holders[index]);
                uint256 amount = _getRedemptionAmount(bond, tokensAmount, nominalValue, paymentToken);

                if (!_isValidAmount(amount)) {
                    result.failedAddresses[payingArraysIndexes.failedAddressesIndex] = holder;
                    unchecked {
                        ++payingArraysIndexes.failedAddressesIndex;
                        ++index;
                    }
                    continue;
                }

                if (!_valueFitsInInt64(uint256(uint64(batchInfo.totalAmount)) + amount)) {
                    // batch transfer payment
                    uint256 succeededResults;
                    uint256 failedResults;
                    (succeededResults, failedResults) = _processBatchRedemption(
                        batchInfo,
                        paymentToken,
                        payingArraysIndexes,
                        result
                    );

                    if (succeededResults > 0) {
                        _redeemBondHolders(bond, holders);
                    }
                    payingArraysIndexes.succeededAddressesIndex += succeededResults;
                    payingArraysIndexes.failedAddressesIndex += failedResults;

                    batchInfo.holders = new address[](holders.length);
                    batchInfo.amounts = new int64[](holders.length);
                    batchInfo.totalAmount = 0;
                    payingArraysIndexes.batchIndex = 0;
                }

                batchInfo.holders[payingArraysIndexes.batchIndex] = holder;
                batchInfo.amounts[payingArraysIndexes.batchIndex] = int64(int256(amount));
                batchInfo.totalAmount += batchInfo.amounts[payingArraysIndexes.batchIndex];
                unchecked {
                    ++payingArraysIndexes.batchIndex;
                    ++index;
                }
            }

            // last batch transfer payment
            if (batchInfo.holders[0] != address(0)) {
                uint256 succeededResults;
                uint256 failedResults;
                (succeededResults, failedResults) = _processBatchRedemption(
                    batchInfo,
                    paymentToken,
                    payingArraysIndexes,
                    result
                );
                if (succeededResults > 0) {
                    _redeemBondHolders(bond, holders);
                }
            }
        }
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
    function _processBatchRedemption(
        BatchInfo memory batchInfo,
        address paymentToken,
        PayingArraysIndexes memory payingArraysIndexes,
        ILifeCycleCashFlow.RedemptionPaymentResult memory result
    ) private returns (uint256 succeededResults, uint256 failedResults) {
        if (_payBatchHoldersRedemption(batchInfo.holders, batchInfo.amounts, batchInfo.totalAmount, paymentToken)) {
            (result.succeededAddresses, result.paidAmounts) = _populateSourceArraysFromDataArrays(
                result.succeededAddresses,
                payingArraysIndexes.succeededAddressesIndex,
                batchInfo.holders,
                result.paidAmounts,
                batchInfo.amounts
            );
            return (result.succeededAddresses.length, 0);
        } else {
            result.failedAddresses = _populateSourceArrayFromDataArray(
                result.failedAddresses,
                payingArraysIndexes.failedAddressesIndex,
                batchInfo.holders
            );
            return (0, result.failedAddresses.length);
        }
    }

    /*
     * @dev Redeem the bond tokens of a list of holders
     *
     * @param bond The bond the redemption belongs to
     * @param holders The holders whose bonds will be redeemed
     * @param tokensAmounts The amounts of tokens to be redeemed for each holder
     */
    function _redeemBondHolders(address bond, address[] memory holders) private {
        for (uint256 index; index < holders.length; ) {
            _redeemBondHolder(bond, holders[index]);

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
    function _redeemBondHolder(address bond, address holder) private {
        bytes32[] memory partitions = IERC1410Read(bond).partitionsOf(holder);
        for (uint256 i; i < partitions.length; ) {
            bytes32 partition = partitions[i];
            try
                IERC1410Read(bond).balanceOfByPartition(partition, holder)
            returns (uint256 partitionBalance) {
                try
                    IBond(bond).redeemAtMaturityByPartition(
                        holder,
                        partition,
                        partitionBalance
                    )
                {} catch {
                    revert ILifeCycleCashFlow.RedeemAtMaturityByPartitionError(
                        bond,
                        holder,
                        partition
                    );
                }
            } catch {
                revert ILifeCycleCashFlow.BalanceOfByPartitionError(bond, holder, partition);
            }

            unchecked {
                ++i;
            }
        }
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
     * @dev Pay an amount of payment tokens to a holder for a distribution
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
        address paymentToken,
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount
    ) private returns (bool) {
        if (
            transferTokens(
                paymentToken,
                _createTransferAccounts(holders, address(this)),
                _createTransferAmounts(amounts, -totalAmount)
            ) == HederaResponseCodes.SUCCESS
        ) {
            _setDistributionHoldersPaid(distributionId, holders);
            return true;
        }
        return false;
    }

    /*
     * @dev Pay an amount of payment tokens to a holder for a redemption
     *
     * @param holder The holder address to be paid
     * @param amount The amount of payment tokens to be paid to the holder
     * @param totalAmount The total amount to be paid to the holders
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payBatchHoldersRedemption(
        address[] memory holders,
        int64[] memory amounts,
        int64 totalAmount,
        address paymentToken
    ) private returns (bool) {
        if (
            transferTokens(
                paymentToken,
                _createTransferAccounts(holders, address(this)),
                _createTransferAmounts(amounts, -totalAmount)
            ) == HederaResponseCodes.SUCCESS
        ) {
            return true;
        }
        return false;
    }

    /*
     * @dev Checks if a distribution was already paid to a holder
     *
     * @param distributionId The distribution identifier
     * @param holder The holder to the if the distribution was already paid
     *
     * @return True if the distribution was already paid to the holder, false otherwise
     */
    function _isDistributionHolderPaid(uint256 distributionId, address holder) internal view returns (bool) {
        return _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionId][holder];
    }

    /*
     * @dev Get the LifeCycleCashFlow storage
     *
     * @returns The LifeCycleCashFlow storage
     */
    function _lifeCycleCashFlowStorage()
        internal
        pure
        returns (LifeCycleCashFlowStorage storage lifeCycleCashFlowStorage)
    {
        bytes32 position = LIFECYCLE_CASH_FLOW_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lifeCycleCashFlowStorage.slot := position
        }
    }

    /*
     * @dev Sets a payment to an array of holders for a distribution
     *
     * @param distributionId The distribution paid to a holder
     * @param holderss The array of holders who were paid
     */
    function _setDistributionHoldersPaid(uint256 distributionId, address[] memory holders) private {
        for (uint256 index; index < holders.length; ) {
            _setDistributionHolderPaid(distributionId, holders[index]);

            unchecked {
                ++index;
            }
        }
    }

    /*
     * @dev Sets a payment to a holder for a distribution
     *
     * @param distributionId The distribution paid to a holder
     * @param holders The holder was were paid
     */
    function _setDistributionHolderPaid(uint256 distributionId, address holder) private {
        _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionId][holder] = true;
    }

    /*
     * @dev Get the amount of asset tokens of a holder
     *
     * @param asset The asset the holder's balance is requested
     * @param holder The holder whose tokens are requested
     *
     * @return The amount of tokens
     */
    function _getTokensAmount(address asset, address holder) private view returns (uint256) {
        try IERC1410(asset).balanceOf(holder) returns (uint256 tokensAmount) {
            return tokensAmount;
        } catch {
            return 0;
        }
    }

    /*
     * @dev Get a list of holders of a distribution by page
     *
     * @param asset The asset the holders belongs to
     * @param distributionId The asset distribution identifier
     * @param pageIndex The index of the page
     * @param pageLength The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getDistributionHolders(
        address asset,
        uint256 distributionId,
        uint256 pageIndex,
        uint256 pageLength
    ) private view returns (address[] memory holders) {
        try IBondRead(asset).getCouponHolders(distributionId, pageIndex, pageLength) returns (
            address[] memory distributionHolders
        ) {
            return holders = distributionHolders;
        } catch {
            return holders;
        }
    }

    /*
     * @dev Get a list of holders of an asset by page
     *
     * @param asset The asset the holders belongs to
     * @param pageIndex The index of the page
     * @param pageLength The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getAssetHolders(
        address asset,
        uint256 pageIndex,
        uint256 pageLength
    ) private view returns (address[] memory holders) {
        try ISecurity(asset).getSecurityHolders(pageIndex, pageLength) returns (address[] memory assetHolders) {
            return holders = assetHolders;
        } catch {
            return holders;
        }
    }

    /*
     * @dev Check that today is the execution date of the distributionId
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The distribution identifier
     */
    function _checkDistributionDate(address asset, uint256 distributionId) private view {
        uint256 executionDateInit = _getDistributionExecutionDate(asset, distributionId);
        _checkPaymentDate(executionDateInit, _blockTimestamp());
    }

    /*
     * @dev Check that today is the maturity date of the bond
     *
     * @param bond The bond address
     */
    function _checkRedemptionDate(address bond) private view {
        uint256 redemptionDateInit = _getRedemptionDate(bond);
        _checkPaymentDate(redemptionDateInit, _blockTimestamp());
    }

    /*
     * @dev Get the distribution execution date
     *
     * @param asset The asset its distribution execution date is requested
     * @param distributionId The identifier of the distribution
     *
     * @returns The distribution execution date
     */
    function _getDistributionExecutionDate(address asset, uint256 distributionId) private view returns (uint256) {
        return IBondRead(asset).getCoupon(distributionId).coupon.executionDate;
    }

    /*
     * @dev Get the bond redemption date
     *
     * @param bond The bond its redemption date is requested
     *
     * @returns The bond redemption date
     */
    function _getRedemptionDate(address bond) private view returns (uint256) {
        return IBondRead(bond).getBondDetails().maturityDate;
    }

    /*
     * @dev Check that the contract manages a certain asset
     *
     * @param asset The address of the asset to check
     */
    function _checkAsset(address asset) private view {
        if (asset != _lifeCycleCashFlowStorage().asset) {
            revert ILifeCycleCashFlow.InvalidAsset(asset);
        }
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
        uint256 succeededAddressesIndex,
        address[] memory dataAddressArray,
        uint256[] memory sourceUint256Array,
        int64[] memory dataInt64Array
    ) private pure returns (address[] memory resultAddressArray, uint256[] memory resultUint256Array) {
        for (uint256 index; index < dataAddressArray.length; ) {
            sourceAddressArray[index + succeededAddressesIndex] = dataAddressArray[index];
            sourceUint256Array[index + succeededAddressesIndex] = uint256(uint64(dataInt64Array[index]));

            unchecked {
                ++index;
            }
        }
        resultAddressArray = sourceAddressArray;
        resultUint256Array = sourceUint256Array;
    }

    /**
     * @dev Check whether an amount is valid (fits in int64 and greater than 0)
     *
     * @param amount The amount to be checked
     *
     * @return True if the amount is valid, false otherwise
     */
    function _isValidAmount(uint256 amount) private pure returns (bool) {
        return amount > 0 && _valueFitsInInt64(amount);
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
        uint256 failedAddressesIndex,
        address[] memory dataAddressArray
    ) private pure returns (address[] memory resultArray) {
        for (uint256 index; index < dataAddressArray.length; ) {
            sourceAddressArray[index + failedAddressesIndex] = dataAddressArray[index];

            unchecked {
                ++index;
            }
        }
        resultArray = sourceAddressArray;
    }

    /*
     * @dev Creates an array of addresses by adding a value at the end of another array
     *
     * @param arr The original array
     * @param val The value to be added at the end of the array
     *
     * @return The new array
     */
    function _createTransferAccounts(address[] memory arr, address val) private pure returns (address[] memory newArr) {
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
    function _createTransferAmounts(int64[] memory arr, int64 val) private pure returns (int64[] memory newArr) {
        newArr = new int64[](arr.length + 1);
        for (uint256 i; i < arr.length; i++) newArr[i] = arr[i];
        newArr[arr.length] = val;
    }

    /*
     * @dev Check that today is the payment date of a distribution
     *
     * @param initialDate The payment initialDate
     * @param currentDate The current date
     *
     * @returns True if the the current date is between the initial and the ending date
     * @returns The payment ending date
     */
    function _checkPaymentDate(uint256 initialDate, uint256 currentDate) private pure {
        if (initialDate == 0 || currentDate < initialDate) {
            revert ILifeCycleCashFlow.NotPaymentDate(initialDate, currentDate);
        }
    }
}
