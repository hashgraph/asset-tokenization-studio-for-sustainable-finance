// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { IPaymentTokenFactory } from "../interfaces/IPaymentTokenFactory.sol";
import {
    HederaTokenService,
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IHederaTokenService } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { ExpiryHelper } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/ExpiryHelper.sol";
import { KeyHelper } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol";

contract PaymentTokenFactory is IPaymentTokenFactory, ExpiryHelper, KeyHelper, HederaTokenService {
    /**
     * @dev Create a payment token
     *
     * @param name The name of the payment token
     * @param symbol The symbol of the payment token
     * @param initialSupply The initial supply of the payment token
     * @param decimals The decimals number of the payment token
     *
     * @return tokenAddress The payment token address
     */
    function createPaymentToken(
        string memory name,
        string memory symbol,
        int64 initialSupply,
        int32 decimals
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
        (responseCode, tokenAddress) = createFungibleToken(tokenData, initialSupply, decimals);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert PaymentTokenCreateError(name, symbol, responseCode);
        }

        emit PaymentTokenCreated(tokenAddress);
    }

    /**
     * @dev Transfer an amount of payment tokens
     *
     * @param token The address of the payment token to be transferred
     * @param to The address of the payment token destination
     * @param amount The amount of payment tokens to be transferred
     */
    function transferPaymentToken(address token, address to, int64 amount) external {
        int responseCode = transferToken(token, address(this), to, amount);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert PaymentTokenTransferError(token, to, amount);
        }
    }
}
