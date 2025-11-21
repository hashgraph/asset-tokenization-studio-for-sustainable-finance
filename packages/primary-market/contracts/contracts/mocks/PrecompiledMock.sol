// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { HederaResponseCodes } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { MockERC20 } from "./MockERC20.sol";
// solhint-enable max-line-length

interface IPrecompiledMock {
    function transferTokens(
        address token,
        address[] memory accountIds,
        int64[] memory amounts
    ) external returns (int32 responseCode);
    function associateToken(address account, address token) external returns (int32 responseCode);
    function setPrecompiledTransferStatus(bool _success) external;
    function setPrecompiledAssociationStatus(bool _success) external;
    function getPrecompiledTransferStatus() external view returns (bool);
    function getPrecompiledAssociationStatus() external view returns (bool);
}

contract PrecompiledMockStorageWrapper {
    bool private _transferSuccess;
    bool private _associationSuccess;

    function _transferTokens(
        address token,
        address[] calldata accountIds,
        int64[] calldata amounts
    ) internal virtual returns (int32 responseCode) {
        if (_getPrecompiledTransferStatus() == false) return HederaResponseCodes.UNKNOWN;

        MockERC20(token).approveFor(msg.sender, address(this), type(uint256).max);

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

    function _associateToken(address, address) internal returns (int32 responseCode) {
        if (_getPrecompiledAssociationStatus()) return HederaResponseCodes.SUCCESS;
        else return HederaResponseCodes.UNKNOWN;
    }

    function _setPrecompiledTransferStatus(bool success_) internal {
        _transferSuccess = success_;
    }

    function _setPrecompiledAssociationStatus(bool success_) internal {
        _associationSuccess = success_;
    }

    function _getPrecompiledTransferStatus() internal view returns (bool) {
        return _transferSuccess;
    }

    function _getPrecompiledAssociationStatus() internal view returns (bool) {
        return _associationSuccess;
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

    function associateToken(address account, address token) external returns (int32 responseCode) {
        return _associateToken(account, token);
    }

    function setPrecompiledTransferStatus(bool success_) external {
        _setPrecompiledTransferStatus(success_);
    }

    function setPrecompiledAssociationStatus(bool success_) external {
        _setPrecompiledAssociationStatus(success_);
    }

    function getPrecompiledTransferStatus() external view returns (bool) {
        return _getPrecompiledTransferStatus();
    }

    function getPrecompiledAssociationStatus() external view returns (bool) {
        return _getPrecompiledAssociationStatus();
    }
}
