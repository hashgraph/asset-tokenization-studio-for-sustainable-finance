// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import { IProceedsManagement } from "../../interfaces/IProceedsManagement.sol";
import { LifeCycleCashFlowStorageWrapper } from "../lifecyclecashflow/LifeCycleCashFlowStorageWrapper.sol";
import { IProceedRecipients } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/proceedRecipients/IProceedRecipients.sol";
import { HederaResponseCodes } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

abstract contract ProceedsManagementStorageWrapper is LifeCycleCashFlowStorageWrapper {
    /**
     * @dev Check whether a proceeds recipient belongs to the bond
     *
     * @param proceedsRecipient The proceeds recipient to be checked
     */
    modifier checkProceedRecipient(address proceedsRecipient) {
        _checkProceedRecipient(proceedsRecipient);
        _;
    }

    /**
     * @dev Transfer an amount of payment tokens to a certain account
     *
     * @param to The account the payment tokens are transferred to
     * @param amount The amount of payment tokens to be transferred
     */
    function _transferPaymentToken(address to, uint256 amount) internal {
        if (!_uint256FitsIntoInt64(amount)) {
            revert IProceedsManagement.NotAllowedAmount(amount);
        }

        int64 transformedAmount = int64(int256(amount));
        int256 responseCode = transferToken(_getPaymentToken(), address(this), to, transformedAmount);
        if (responseCode == HederaResponseCodes.SUCCESS) return;
        if (responseCode == HederaResponseCodes.INSUFFICIENT_TOKEN_BALANCE) {
            revert IProceedsManagement.NotEnoughBalance(amount);
        }
        revert IProceedsManagement.TransferPaymentTokenFailed(to, amount);
    }

    /**
     * @dev Transfer a certain environmental asset token id to an account
     *
     * @param environmentalAsset The contract that minted the environmental asset token
     * @param to The account the environmental asset token is transferred to
     * @param serialNumber The id of the environmental asset token being transferred
     */
    function _transferEnvironmentalAssetToken(address environmentalAsset, address to, uint256 serialNumber) internal {
        if (!_uint256FitsIntoInt64(serialNumber)) {
            revert IProceedsManagement.NotAllowedSerialNumber(serialNumber);
        }

        int64 transformedSerialNumber = int64(int256(serialNumber));
        int256 responseCode = transferNFT(environmentalAsset, address(this), to, transformedSerialNumber);

        if (responseCode == HederaResponseCodes.SUCCESS) return;
        if (responseCode == HederaResponseCodes.SENDER_DOES_NOT_OWN_NFT_SERIAL_NO) {
            revert IProceedsManagement.NotTokenIdOwner(serialNumber);
        }
        revert IProceedsManagement.TransferEnvironmentalAssetTokenFailed(environmentalAsset, to, serialNumber);
    }

    /**
     * @dev Fund a proceeds recipient by transferring it payment tokens
     *
     * @param proceedsRecipient The proceeds recipient to fund
     * @param amount The amount of payment tokens to transfer
     */
    function _fundProceedsRecipient(address proceedsRecipient, uint256 amount) internal {
        _transferPaymentToken(proceedsRecipient, amount);
    }

    /*
     * @dev Check whether a proceeds recipient belongs to the bond
     *
     * @param proceedsRecipient The proceeds recipient to be checked
     */
    function _checkProceedRecipient(address proceedsRecipient) private view {
        bool proceedsRecipientBelongsToBond = IProceedRecipients(_getAsset()).isProceedRecipient(proceedsRecipient);
        if (!proceedsRecipientBelongsToBond) {
            revert IProceedsManagement.WrongProceedsRecipient(proceedsRecipient);
        }
    }

    /*
     * @dev Check whether a value is greater thant the maximum int64
     *
     * @param value True if the value is not greater than the maximum int64, false otherwise
     */
    function _uint256FitsIntoInt64(uint256 value) private pure returns (bool) {
        // solhint-disable-next-line gas-strict-inequalities
        return value <= uint256(uint64(type(int64).max));
    }
}
