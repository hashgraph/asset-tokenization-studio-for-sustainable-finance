// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    ProceedsManagementStorageWrapper
} from './ProceedsManagementStorageWrapper.sol';

abstract contract ProceedsManagement is ProceedsManagementStorageWrapper {

     /*
      * @dev Transfers an amount of payment tokens to an address
      *
      * @param to The address the payment tokens are transferred to
      * @param amount The amount of payment tokens to transfer
      */
    function transferPaymentToken(address to, uint256 amount) external {
        _transferPaymentToken(to, amount);
        emit PaymentTokenTransferred(to, amount);
    }

     /*
      * @dev Transfers an ERC721 token to an address
      *
      * @param erc721 The address of the erc721 token contract
      * @param to The address the payment tokens are transferred to
      * @param tokenId The tokenId of the erc721 token
      */
    function transferERC721Token(address erc721, address to, uint256 tokenId) external {
        _transferERC721Token(erc721, to, tokenId);
        emit ERC721TokenTransferred(erc721, to, tokenId);
    }

     /*
      * @dev Funds a proceeds beneficiary with an amount of tokens
      *
      * @param beneficiary The address of the proceeds beneficiary that is funded
      * @param token The amount the proceeds beneficiary is funded with
      */
    function fundProceedsBeneficiary(address proceedsBeneficiary, uint256 amount) external {
        _fundProceedsBeneficiary(proceedsBeneficiary, amount);
        emit ProceedsBeneficiaryFunded(proceedsBeneficiary, amount);
    }
}