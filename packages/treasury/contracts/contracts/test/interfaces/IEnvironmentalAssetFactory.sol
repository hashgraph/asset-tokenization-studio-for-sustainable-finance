// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IEnvironmentalAssetFactory {
    /**
     * @dev Emitted when an environmental asset is created
     *
     * @param tokenAddress The address of the just created environmental asset address
     */
    event EnvironmentalAssetCreated(address indexed tokenAddress);

    /**
     * @dev Emitted when a NFT is minted
     *
     * @param tokenId The token identifier of the just minted NFT
     */
    event NFTMinted(int64 indexed tokenId);

    /**
     * @dev Error thrown when the creation of the environmental asset failed
     *
     * @param name The name of the environmental asset
     * @param symbol The symbol of the environmental asset
     * @param responseCode The response code
     */
    error EnvironmentalAssetCreateError(
        string name,
        string symbol,
        int256 responseCode
    );

    /**
     * @dev Error thrown when the transfer of an environmental asset token failed
     *
     * @param token the Address of the transferred environmental asset
     * @param to The address of the environmental asset token destination
     * @param serialNumber The serial number of the transferred environmental asset token
     */
    error EnvironmentalAssetTokenTransferError(
        address token,
        address to,
        int64 serialNumber
    );

    /**
     * @dev Create an environmental asset
     *
     * @param name The name of the environmental asset
     * @param symbol The symbol of the environmental asset
     *
     * @return tokenAddress The address of the environmental asset
     */
    function createEnvironmentalAsset(
        string memory name,
        string memory symbol
    ) external payable returns (address tokenAddress);

    /**
     * @dev Transfer an environmental asset token
     *
     * @param token The address of the environmental asset token to be transferred
     * @param to The address of the environmental asset token destination
     * @param serialNumber The serial number of the environmental asset token to be transferred
     */
    function transferEnvironmentalAssetToken(
        address token,
        address to,
        int64 serialNumber
    ) external;
}
