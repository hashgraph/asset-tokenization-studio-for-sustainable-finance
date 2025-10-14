// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.18;

import {
    HederaTokenService,
    HederaResponseCodes
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import {
    ExpiryHelper
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/ExpiryHelper.sol';
import {
    KeyHelper
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol';

contract EnvironmentalAssetFactory is
    ExpiryHelper,
    KeyHelper,
    HederaTokenService
{
    bytes private constant DEFAULT_METADATA = hex"01";

    event EnvironmentalAssetCreated(address indexed tokenAddress);
    event NFTMinted(int64 indexed tokenId);

    error EnvironmentalAssetTokenTransferError(address token, address to, int64 serialNumber);

    function createEnvironmentalAsset(
        string memory name,
        string memory symbol
    ) external payable returns (address tokenAddress) {
        int responseCode;
        IHederaTokenService.HederaToken memory tokenData;
        tokenData.name = name;
        tokenData.symbol = symbol;
        tokenData.treasury = address(this);
        tokenData.tokenSupplyType = false;
        tokenData.maxSupply = 0;
        tokenData.freezeDefault = false;
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = IHederaTokenService.TokenKey({
            keyType: 16,
            key: IHederaTokenService.KeyValue({
                inheritAccountKey: false,
                contractId: address(this),
                ed25519: bytes(''),
                ECDSA_secp256k1: bytes(''),
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
        require(
            responseCode == HederaResponseCodes.SUCCESS,
            Strings.toString(responseCode)
        );

        mintNFT(tokenAddress, DEFAULT_METADATA);

        emit EnvironmentalAssetCreated(tokenAddress);
    }

    function transferEnvironmentalAssetToken(
        address token,
        address to,
        int64 serialNumber
    ) external {
        int responseCode = transferNFT(token, address(this), to, serialNumber);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert EnvironmentalAssetTokenTransferError(token, to, serialNumber);
        }
    }

    function mintNFT(address token, bytes memory metadata) private {
        bytes[] memory arr = new bytes[](1);
        arr[0] = metadata;
        (
            int responseCode,
            int64 newTotalSupply,
            int64[] memory serialNumbers
        ) = mintToken(token, 0, arr);
        emit NFTMinted(serialNumbers[0]);
    }
}
