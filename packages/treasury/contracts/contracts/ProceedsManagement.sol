// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    ProceedsManagementStorageWrapper
} from './ProceedsManagementStorageWrapper.sol';
import {PROCEEDS_FULL_MANAGER, FUNDS_MANAGER_ROLE} from './constants/roles.sol';

abstract contract ProceedsManagement is ProceedsManagementStorageWrapper {
    /*
     * @dev Transfers an amount of payment tokens to an address
     *
     * @param to The address the payment tokens are transferred to
     * @param amount The amount of payment tokens to transfer
     */
    function transferPaymentToken(
        address to,
        uint256 amount
    ) external override onlyUnpaused onlyRole(PROCEEDS_FULL_MANAGER) {
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
    function transferERC721Token(
        address erc721,
        address to,
        uint256 tokenId
    )
        external
        override
        onlyUnpaused
        onlyRole(PROCEEDS_FULL_MANAGER)
        onlyOwnedErc721(tokenId)
    {
        _transferERC721Token(erc721, to, tokenId);
        emit ERC721TokenTransferred(erc721, to, tokenId);
    }

    /*
     * @dev Funds a proceeds recipient with an amount of tokens
     *
     * @param recipient The address of the proceeds recipient that is funded
     * @param token The amount the proceeds recipient is funded with
     */
    function fundProceedsRecipient(
        address proceedsRecipient,
        uint256 amount
    )
        external
        override
        onlyUnpaused
        onlyRole(FUNDS_MANAGER_ROLE)
        onlyForBondProceedsRecipients(proceedsRecipient)
    {
        _fundProceedsRecipient(proceedsRecipient, amount);
        emit ProceedsRecipientFunded(proceedsRecipient, amount);
    }
}
