// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    IProceedsManagementStorageWrapper
} from './interfaces/IProceedsManagementStorageWrapper.sol';
import {PortfolioStorageWrapper} from './PortfolioStorageWrapper.sol';
// TODO: Waiting, to uncomment, for breaking bonds team to deliver a new release of ATS contracts package
/*import {
    IProceedRecipients
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/proceedRecipients/IProceedRecipients.sol';*/
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {
    HederaResponseCodes
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';

abstract contract ProceedsManagementStorageWrapper is
    IProceedsManagementStorageWrapper,
    PortfolioStorageWrapper
{
    /**
     * @dev Check whether a proceeds recipient belongs to the bond
     *
     * @param proceedsRecipient The proceeds recipient to be checked
     */
    modifier onlyForBondProceedsRecipients(address proceedsRecipient) {
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
        try
            IHederaTokenService(address(this)).transferFrom(
                _getPaymentToken(),
                address(this),
                to,
                amount
            )
        returns (int64 responseCode) {
            if (responseCode == HederaResponseCodes.SUCCESS) return;

            if (
                responseCode == HederaResponseCodes.INSUFFICIENT_TOKEN_BALANCE
            ) {
                revert NotEnoughBalance(amount);
            }

            revert TransferPaymentTokenFailed(to, amount);
        } catch {
            revert TransferPaymentTokenFailed(to, amount);
        }
    }

    /**
     * @dev Transfer a certain environmental asset token id to an account
     *
     * @param environmentalAsset The contract that minted the environmental asset token
     * @param to The account the environmental asset token is transferred to
     * @param tokenId The id of the environmental asset token being transferred
     */
    function _transferEnvironmentalAssetToken(
        address environmentalAsset,
        address to,
        uint256 tokenId
    ) internal {
        try
            IHederaTokenService(address(this)).transferFromNFT(
                environmentalAsset,
                address(this),
                to,
                tokenId
            )
        returns (int64 responseCode) {
            if (responseCode == HederaResponseCodes.SUCCESS) return;

            if (
                responseCode ==
                HederaResponseCodes.SENDER_DOES_NOT_OWN_NFT_SERIAL_NO
            ) {
                revert NotTokenIdOwner(tokenId);
            }

            revert TransferEnvironmentalAssetTokenFailed(
                environmentalAsset,
                to,
                tokenId
            );
        } catch {
            revert TransferEnvironmentalAssetTokenFailed(
                environmentalAsset,
                to,
                tokenId
            );
        }
    }

    /**
     * @dev Fund a proceeds recipient by transferring it payment tokens
     *
     * @param proceedsRecipient The proceeds recipient to fund
     * @param amount The amount of payment tokens to transfer
     */
    function _fundProceedsRecipient(
        address proceedsRecipient,
        uint256 amount
    ) internal {
        _transferPaymentToken(proceedsRecipient, amount);
    }

    /*
     * @dev Check whether a proceeds recipient belongs to the bond
     *
     * @param proceedsRecipient The proceeds recipient to be checked
     */
    function _checkProceedRecipient(address proceedsRecipient) private view {
        // TODO: Waiting, to uncomment, for breaking bonds team to deliver a new release of ATS contracts package
        /*if (IProceedRecipients(_getAsset()).isProceedRecipient(proceedsRecipient)) {
            revert WrongProceedsRecipient(proceedsRecipient);
        }*/
    }
}
