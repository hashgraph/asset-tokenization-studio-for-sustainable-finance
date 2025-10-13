// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface IProceedsManagementStorageWrapper {
    /**
     * @notice Error thrown when attempting to transfer an amount of payment tokens larger than the Treasury's balance
     *
     * @param amount The amount of payment tokens to transfer
     */
    error NotEnoughBalance(uint256 amount);

    /**
     * @notice Error thrown when something fails while attempting to transfer payment tokens
     *
     * @param to The address the payment tokens are transferred to
     * @param amount The amount of payment tokens to transfer
     */
    error TransferPaymentTokenFailed(address to, uint256 amount);

    /**
     * @notice Error thrown when something fails while attempting to transfer an ERC721 token
     *
     * @param erc721 The address of the erc721 token contract
     * @param to The address the payment tokens are transferred to
     * @param tokenId The tokenId of the erc721 token
     */
    error TransferERC721TokenFailed(
        address erc721,
        address to,
        uint256 tokenId
    );
}
