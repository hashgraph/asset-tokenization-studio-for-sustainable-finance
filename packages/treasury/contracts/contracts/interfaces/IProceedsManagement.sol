// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface IProceedsManagement {

     /*
      * @dev Emitted when the payment tokens were transferred to an address
      *
      * @param to The address the payment tokens were transferred to
      * @param amount The amount of payment tokens transferred
      */
     event PaymentTokenTransferred(address to, uint256 amount);

     /*
      * @dev Emitted when an ERC721 token was transferred to an address
      *
      * @param erc721 The address of the erc721 token
      * @param to The address the payment tokens were transferred to
      * @param tokenId The tokenId of the erc721 token
      */
     event ERC721TokenTransferred(address erc721, address to, uint256 tokenId);

     /*
      * @dev Emitted when a proceeds recipient was funded with an amount
      *
      * @param proceedsRecipient The address of the proceeds recipient that was funded
      * @param token The amount the proceeds recipient was funded with
      */
     event ProceedsRecipientFunded(address proceedsRecipient, uint256 amount);

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
     error TransferERC721TokenFailed(address erc721, address to, uint256 tokenId);

     /**
      * @notice Error thrown when attempting to transfer an amount of payment tokens larger than the Treasury's balance
      *
      * @param amount The amount of payment tokens to transfer
      */
     error NotEnoughBalance(uint256 amount);

    /**
     * @notice Error thrown when funding an account that is not an asset proceeds recipient
     *
     * @param proceedsRecipient The address of the proceeds recipient that is funded
     */
    error WrongProceedsRecipient(address proceedsRecipient);

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
    ) external;

     /*
      * @dev Transfers an ERC721 token to an address
      *
      * @param erc721 The address of the erc721 token contract
      * @param to The address the payment tokens are transferred to
      * @param tokenId The tokenId of the erc721 token
      */
     function transferERC721Token(address erc721, address to, uint256 tokenId) external;

     /*
      * @dev Funds a proceeds recipient with an amount of tokens
      *
      * @param recipient The address of the proceeds recipient that is funded
      * @param token The amount the proceeds recipient is funded with
      */
     function fundProceedsRecipient(address proceedsRecipient, uint256 amount) external;
}