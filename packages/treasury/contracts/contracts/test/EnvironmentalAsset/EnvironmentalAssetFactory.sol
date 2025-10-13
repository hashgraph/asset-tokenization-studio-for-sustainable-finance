// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.18;

import {
    HederaTokenService,
    HederaResponseCodes
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import {
    ExpiryHelper
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/ExpiryHelper.sol';
import {
    KeyHelper
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol';

contract EnvironmentalAssetFactory is ExpiryHelper, KeyHelper, HederaTokenService {

    event TokenCreated(address indexed tokenAddress);

    /*constructor() payable {
    }*/

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
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
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
        require(responseCode == HederaResponseCodes.SUCCESS, Strings.toString(responseCode)
        );

        emit TokenCreated(tokenAddress);
    }
}