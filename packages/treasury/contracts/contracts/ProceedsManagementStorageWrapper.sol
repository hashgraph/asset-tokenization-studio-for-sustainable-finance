// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {IProceedsManagement} from './interfaces/IProceedsManagement.sol';
import {
    LifeCycleCashFlowStorageWrapper
} from './LifeCycleCashFlowStorageWrapper.sol';
/*import {
    IProceedRecipients
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/proceedRecipients/IProceedRecipients.sol';*/
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

abstract contract ProceedsManagementStorageWrapper is
    IProceedsManagement,
    LifeCycleCashFlowStorageWrapper
{
    modifier onlyForBondProceedsRecipients(address proceedsRecipient) {
        _checkProceedRecipient(proceedsRecipient);
        _;
    }

    modifier onlyOwnedErc721(uint256 tokenId) {
        _checkOwnedErc721(tokenId);
        _;
    }

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

    function _transferERC721Token(
        address erc721,
        address to,
        uint256 tokenId
    ) internal {
        // TODO: Se debe obtener el environmentalToken del storage de la faceta portfolio
        IERC721 environmentalToken; // = _lifeCycleCashFlowStorage().paymentToken;
        try
            environmentalToken.transferFrom(address(this), to, tokenId)
        {} catch {
            revert TransferERC721TokenFailed(erc721, to, tokenId);
        }
    }

    function _fundProceedsRecipient(
        address proceedsRecipient,
        uint256 amount
    ) internal {
        _transferPaymentToken(proceedsRecipient, amount);
    }

    /*
     * @dev Check that today is the execution date of the distributionId
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkProceedRecipient(address proceedsRecipient) private view {
        /*if (IProceedRecipients(_getAsset()).isProceedRecipient(proceedsRecipient)) {
            revert WrongProceedsRecipient(proceedsRecipient);
        }*/
    }

    /*
     * @dev Check that today is the execution date of the distributionId
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkOwnedErc721(uint256 tokenId) private view {
        // TODO: Hay que comprobar que el tokenId pertenece al contrato treasury Los tokens erc721 se añaden en la faceta porfolio, por lo que será en el storage de portfolio donde se alamcenen esos tokens
        /*if () {
            revert NotTokenIdOwner(tokenId);
        }*/
    }
}
