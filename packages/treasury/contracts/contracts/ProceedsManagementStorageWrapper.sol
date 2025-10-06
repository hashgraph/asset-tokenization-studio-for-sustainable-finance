// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {IProceedsManagement} from './interfaces/IProceedsManagement.sol';
import {
    LifeCycleCashFlowStorageWrapper
} from './LifeCycleCashFlowStorageWrapper.sol';
// TODO: Waiting, to uncomment, for breaking bonds team to deliver a new release of ATS contracts package
/*import {
    IProceedRecipients
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/proceedRecipients/IProceedRecipients.sol';*/
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

abstract contract ProceedsManagementStorageWrapper is
    IProceedsManagement,
    LifeCycleCashFlowStorageWrapper
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
     * @dev Check whether a erc721 token is owned by the treasury
     *
     * @param tokenId The id of the token to be checked
     */
    modifier onlyOwnedErc721(uint256 tokenId) {
        _checkOwnedErc721(tokenId);
        _;
    }

    /**
     * @dev Transfer an amount of payment tokens to a certain account
     *
     * @param to The account the payment tokens are transferred to
     * @param amount The amount of payment tokens to be transferred
     */
    function _transferPaymentToken(address to, uint256 amount) internal {
        IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;
        if (paymentToken.balanceOf(address(this)) < amount) {
            revert NotEnoughBalance(amount);
        }

        try paymentToken.transfer(to, amount) returns (bool result) {
            if (!result) {
                revert TransferPaymentTokenFailed(to, amount);
            }
        } catch {
            revert TransferPaymentTokenFailed(to, amount);
        }
    }

    /**
     * @dev Transfer a certain erc721 token id to an account
     *
     * @param erc721 The contract that minted the erc721 token
     * @param to The account the erc721 token is transferred to
     * @param tokenId The id of the erc721 token being transferred
     */
    function _transferERC721Token(
        address erc721,
        address to,
        uint256 tokenId
    ) internal {
        // TODO: The environmentalToken must be obtained from portfolio facet storage
        IERC721 environmentalToken; // = _getEnvironmentalToken(erc721, tokenId);
        try
            environmentalToken.transferFrom(address(this), to, tokenId)
        // solhint-disable-next-line no-empty-blocks
        {

        } catch {
            revert TransferERC721TokenFailed(erc721, to, tokenId);
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

    /*
     * @dev Check whether a erc721 token is owned by the treasury
     *
     * @param tokenId The id of the token to be checked
     */
    function _checkOwnedErc721(uint256 tokenId) private view {
        // TODO: Check in the porfolio facet where erc721 tokens are stored
        /*if () {
            revert NotTokenIdOwner(tokenId);
        }*/
    }
}
