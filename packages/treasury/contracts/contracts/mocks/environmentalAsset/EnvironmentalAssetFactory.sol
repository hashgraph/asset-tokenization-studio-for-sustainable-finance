// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { IEnvironmentalAssetFactory } from "../interfaces/IEnvironmentalAssetFactory.sol";
import {
    HederaTokenService,
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IHederaTokenService } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { ExpiryHelper } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/ExpiryHelper.sol";
import { KeyHelper } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol";

contract EnvironmentalAssetFactory is IEnvironmentalAssetFactory, ExpiryHelper, KeyHelper, HederaTokenService {
    bytes private constant DEFAULT_METADATA = hex"01";

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
    ) external payable returns (address tokenAddress) {
        int256 responseCode;
        IHederaTokenService.HederaToken memory tokenData;
        tokenData.name = name;
        tokenData.symbol = symbol;
        tokenData.treasury = address(this);
        tokenData.tokenSupplyType = false;
        tokenData.maxSupply = 0;
        tokenData.freezeDefault = false;
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = IHederaTokenService.TokenKey({
            keyType: 16,
            key: IHederaTokenService.KeyValue({
                inheritAccountKey: false,
                contractId: address(this),
                ed25519: bytes(""),
                ECDSA_secp256k1: bytes(""),
                delegatableContractId: address(0)
            })
        });
        tokenData.tokenKeys = keys;
        IHederaTokenService.Expiry memory expiryInfo;
        expiryInfo.autoRenewAccount = address(this);
        expiryInfo.second = int64(int256(block.timestamp + 90 days));
        expiryInfo.autoRenewPeriod = int64(30 days);
        tokenData.expiry = expiryInfo;
        (responseCode, tokenAddress) = createNonFungibleToken(tokenData); // For NFTs, supply args are ignored

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert EnvironmentalAssetCreateError(name, symbol, responseCode);
        }

        mintNFT(tokenAddress, DEFAULT_METADATA);

        emit EnvironmentalAssetCreated(tokenAddress);
    }

    /**
     * @dev Transfer an environmental asset token
     *
     * @param token The address of the environmental asset token to be transferred
     * @param to The address of the environmental asset token destination
     * @param serialNumber The serial number of the environmental asset token to be transferred
     */
    function transferEnvironmentalAssetToken(address token, address to, int64 serialNumber) external {
        int responseCode = transferNFT(token, address(this), to, serialNumber);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert EnvironmentalAssetTokenTransferError(token, to, serialNumber);
        }
    }

    /**
     * @dev Mint an environmental asset token
     *
     * @param token The address of the environmental asset
     * @param metadata The meta data of the environmental asset token
     */
    function mintNFT(address token, bytes memory metadata) private {
        bytes[] memory arr = new bytes[](1);
        arr[0] = metadata;
        (int responseCode, , int64[] memory serialNumbers) = mintToken(token, 0, arr);
        if (responseCode == HederaResponseCodes.SUCCESS) {
            emit NFTMinted(serialNumbers[0]);
        }
    }
}
