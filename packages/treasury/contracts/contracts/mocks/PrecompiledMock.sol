// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity >=0.8.0 <0.9.0;

import { HederaResponseCodes } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IHederaTokenService } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import { PaymentTokenMock } from "./PaymentTokenMock.sol";
import { EnvironmentalAssetMock } from "./EnvironmentalAssetMock.sol";

interface IPrecompiledMock {
    function transferTokens(
        address token,
        address[] memory accountIds,
        int64[] memory amounts
    ) external returns (int32 responseCode);
    function transferToken(
        address token,
        address sender,
        address receiver,
        int64 amount
    ) external returns (int32 responseCode);
    function transferNFT(
        address token,
        address sender,
        address receiver,
        int64 serialNumber
    ) external returns (int32 responseCode);
    function associateToken(address account, address token) external returns (int32 responseCode);
    function dissociateToken(address account, address token) external returns (int32 responseCode);
    function getFungibleTokenInfo(
        address token
    ) external view returns (int responseCode, IHederaTokenService.FungibleTokenInfo memory tokenInfo);
    function setPrecompiledNegativeDecimals(bool _negativeDecimals) external;
    function setPrecompiledTransferStatus(bool _success) external;
    function getPrecompiledNegativeDecimals() external view returns (bool);
    function getPrecompiledTransferStatus() external view returns (bool);
}

contract PrecompiledMockStorageWrapper {
    bool private _transferSuccess;
    bool private _negativeDecimals;

    function _transferTokens(
        address token,
        address[] calldata accountIds,
        int64[] calldata amounts
    ) internal virtual returns (int32 responseCode) {
        if (_getPrecompiledTransferStatus() == false) return HederaResponseCodes.UNKNOWN;

        PaymentTokenMock(token).approveFor(msg.sender, address(this), type(uint256).max);

        uint256 totalPositive;
        uint256 totalNegative;

        for (uint256 index = 0; index < accountIds.length; ++index) {
            if (amounts[index] < 0) {
                totalNegative += uint256(uint64(-amounts[index]));
                continue;
            }
            totalPositive += uint256(uint64(amounts[index]));
            if (!IERC20(token).transferFrom(msg.sender, accountIds[index], uint256(uint64(amounts[index]))))
                return HederaResponseCodes.UNKNOWN;
        }

        if (totalPositive != totalNegative) return HederaResponseCodes.UNKNOWN;
        return HederaResponseCodes.SUCCESS;
    }

    function _transferToken(
        address token,
        address sender,
        address receiver,
        int64 amount
    ) internal virtual returns (int32 responseCode) {
        if (receiver == address(1)) return HederaResponseCodes.UNKNOWN;

        if (IERC20(token).balanceOf(sender) < uint256(uint64(amount))) {
            return HederaResponseCodes.INSUFFICIENT_TOKEN_BALANCE;
        }

        PaymentTokenMock(token).approveFor(msg.sender, address(this), type(uint256).max);

        if (!IERC20(token).transferFrom(msg.sender, receiver, uint256(uint64(amount)))) {
            return HederaResponseCodes.UNKNOWN;
        }
        return HederaResponseCodes.SUCCESS;
    }

    function _transferNFT(
        address token,
        address sender,
        address receiver,
        int64 serialNumber
    ) internal virtual returns (int32 responseCode) {
        if (IERC721(token).ownerOf(uint256(uint64(serialNumber))) != sender) {
            return HederaResponseCodes.SENDER_DOES_NOT_OWN_NFT_SERIAL_NO;
        }

        EnvironmentalAssetMock(token).approveFor(address(this), uint256(uint64(serialNumber)));

        IERC721(token).transferFrom(msg.sender, receiver, uint256(uint64(serialNumber)));
        return HederaResponseCodes.SUCCESS;
    }

    function _associateToken(address, address token) internal pure returns (int32 responseCode) {
        if (token == address(1)) {
            return HederaResponseCodes.UNKNOWN;
        }

        return HederaResponseCodes.SUCCESS;
    }

    function _dissociateToken(address account, address token) internal view returns (int32 responseCode) {
        if (IERC20(token).balanceOf(account) > 0) {
            return HederaResponseCodes.TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES;
        }

        if (token == address(1)) {
            return HederaResponseCodes.UNKNOWN;
        }

        return HederaResponseCodes.SUCCESS;
    }

    function _getFungibleTokenInfo(
        address token
    ) internal view returns (int responseCode, IHederaTokenService.FungibleTokenInfo memory fungibleTokenInfo) {
        responseCode = HederaResponseCodes.SUCCESS;
        fungibleTokenInfo = IHederaTokenService.FungibleTokenInfo({
            decimals: (_negativeDecimals == true) ? -1 : int32(int8(PaymentTokenMock(token).decimals())),
            tokenInfo: IHederaTokenService.TokenInfo({
                token: IHederaTokenService.HederaToken({
                    name: PaymentTokenMock(token).name(),
                    symbol: PaymentTokenMock(token).symbol(),
                    treasury: address(0),
                    memo: "",
                    tokenSupplyType: true,
                    maxSupply: 0,
                    freezeDefault: false,
                    tokenKeys: new IHederaTokenService.TokenKey[](0),
                    expiry: IHederaTokenService.Expiry({ second: 0, autoRenewAccount: address(0), autoRenewPeriod: 0 })
                }),
                totalSupply: int64(uint64(PaymentTokenMock(token).totalSupply())),
                deleted: false,
                defaultKycStatus: false,
                pauseStatus: false,
                fixedFees: new IHederaTokenService.FixedFee[](0),
                fractionalFees: new IHederaTokenService.FractionalFee[](0),
                royaltyFees: new IHederaTokenService.RoyaltyFee[](0),
                ledgerId: ""
            })
        });
    }

    function _setPrecompiledNegativeDecimals(bool negativeDecimals_) internal {
        _negativeDecimals = negativeDecimals_;
    }

    function _getPrecompiledNegativeDecimals() internal view returns (bool) {
        return _negativeDecimals;
    }

    function _setPrecompiledTransferStatus(bool success_) internal {
        _transferSuccess = success_;
    }

    function _getPrecompiledTransferStatus() internal view returns (bool) {
        return _transferSuccess;
    }
}

contract PrecompiledMock is IPrecompiledMock, PrecompiledMockStorageWrapper {
    function transferTokens(
        address token,
        address[] calldata accountIds,
        int64[] calldata amounts
    ) external returns (int32 responseCode) {
        return _transferTokens(token, accountIds, amounts);
    }

    function transferToken(
        address token,
        address sender,
        address receiver,
        int64 amount
    ) external returns (int32 responseCode) {
        return _transferToken(token, sender, receiver, amount);
    }

    function transferNFT(
        address token,
        address sender,
        address receiver,
        int64 serialNumber
    ) external returns (int32 responseCode) {
        return _transferNFT(token, sender, receiver, serialNumber);
    }

    function associateToken(address account, address token) external pure returns (int32 responseCode) {
        return _associateToken(account, token);
    }

    function dissociateToken(address account, address token) external view returns (int32 responseCode) {
        return _dissociateToken(account, token);
    }

    function getFungibleTokenInfo(
        address token
    ) external view returns (int responseCode, IHederaTokenService.FungibleTokenInfo memory tokenInfo) {
        return _getFungibleTokenInfo(token);
    }

    function setPrecompiledNegativeDecimals(bool negativeDecimals_) external {
        _setPrecompiledNegativeDecimals(negativeDecimals_);
    }

    function getPrecompiledNegativeDecimals() external view returns (bool) {
        return _getPrecompiledNegativeDecimals();
    }

    function setPrecompiledTransferStatus(bool success_) external {
        _setPrecompiledTransferStatus(success_);
    }

    function getPrecompiledTransferStatus() external view returns (bool) {
        return _getPrecompiledTransferStatus();
    }
}
