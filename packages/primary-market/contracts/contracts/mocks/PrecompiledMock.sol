// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { HederaResponseCodes } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PRECOMPILED_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { TimeTravelStorageWrapper } from "@hashgraph/asset-tokenization-contracts/contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { MockERC20 } from "./MockERC20.sol";
interface IPrecompiledMock {
    function transferTokens(
        address token,
        address[] memory accountIds,
        int64[] memory amounts
    ) external returns (int32 responseCode);
    function setPrecompiledTransferStatus(bool _success) external;
    function getPrecompiledTransferStatus() external view returns (bool);
}

contract PrecompiledMockStorageWrapper {
    bool success;

    function _setPrecompiledTransferStatus(bool _success) internal {
        success = _success;
    }

    function _getPrecompiledTransferStatus() internal view returns (bool) {
        return success;
    }

    function _transferTokens(
        address token,
        address[] memory accountIds,
        int64[] memory amounts
    ) internal virtual returns (int32 responseCode) {
        if (_getPrecompiledTransferStatus() == false) return HederaResponseCodes.UNKNOWN;

        MockERC20(token).approveFor(msg.sender, address(this), type(uint256).max);

        uint256 totalPositive;
        uint256 totalNegative;

        for (uint256 index = 0; index < accountIds.length; index++) {
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
}

contract PrecompiledMock is IPrecompiledMock, PrecompiledMockStorageWrapper {
    function transferTokens(
        address token,
        address[] memory accountIds,
        int64[] memory amounts
    ) external returns (int32 responseCode) {
        return _transferTokens(token, accountIds, amounts);
    }

    function setPrecompiledTransferStatus(bool _success) external {
        _setPrecompiledTransferStatus(_success);
    }

    function getPrecompiledTransferStatus() external view returns (bool) {
        return _getPrecompiledTransferStatus();
    }
}
