// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IProceedsManagementStorageWrapper {
    /**
     * @notice Error thrown when transferring an amount of payment tokens greater than the maximum int64
     *
     * @param amount The amount of payment tokens to be transferred
     */
    error NotAllowedAmount(uint256 amount);

    /**
     * @notice Error thrown when transferring a NFT with a serial number greater than the maximum int64
     *
     * @param serialNumber The serial number of the NFT to be transferred
     */
    error NotAllowedSerialNumber(uint256 serialNumber);

    /**
     * @notice Error thrown when attempting to transfer an amount of payment tokens larger than the Treasury's balance
     *
     * @param amount The amount of payment tokens to transfer
     */
    error NotEnoughBalance(uint256 amount);

    /**
     * @notice Error thrown when transferring an environmental asset Token Id the Treasury does not own
     *
     * @param tokenId The tokenId of the environmental asset token
     */
    error NotTokenIdOwner(uint256 tokenId);

    /**
     * @notice Error thrown when something fails while attempting to transfer payment tokens
     *
     * @param to The address the payment tokens are transferred to
     * @param amount The amount of payment tokens to transfer
     */
    error TransferPaymentTokenFailed(address to, uint256 amount);

    /**
     * @notice Error thrown when something fails while attempting to transfer an environmental asset token
     *
     * @param environmentalAsset The address of the environmental asset token contract
     * @param to The address the payment tokens are transferred to
     * @param tokenId The tokenId of the environmental asset token
     */
    error TransferEnvironmentalAssetTokenFailed(address environmentalAsset, address to, uint256 tokenId);

    /**
     * @notice Error thrown when funding an account that is not an asset proceeds recipient
     *
     * @param proceedsRecipient The address of the proceeds recipient that is funded
     */
    error WrongProceedsRecipient(address proceedsRecipient);
}
