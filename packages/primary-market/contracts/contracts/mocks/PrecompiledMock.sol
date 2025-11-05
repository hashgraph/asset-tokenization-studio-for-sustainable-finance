// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { HederaResponseCodes } from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PRECOMPILED_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { TimeTravelStorageWrapper } from "@hashgraph/asset-tokenization-contracts/contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

interface IPrecompiledMock {
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
    ) internal virtual returns (int responseCode) {
        if (_getPrecompiledTransferStatus() == false) return HederaResponseCodes.UNKNOWN;

        for (uint256 index = 0; index < accountIds.length; index++) {
            if (!IERC20(token).transfer(accountIds[index], uint256(uint64(amounts[index]))))
                return HederaResponseCodes.UNKNOWN;
        }

        return HederaResponseCodes.SUCCESS;
    }
}

contract PrecompiledMockFacet is IStaticFunctionSelectors, IPrecompiledMock, PrecompiledMockStorageWrapper {
    function setPrecompiledTransferStatus(bool _success) external {
        _setPrecompiledTransferStatus(_success);
    }

    function getPrecompiledTransferStatus() external view returns (bool) {
        return _getPrecompiledTransferStatus();
    }

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = PRECOMPILED_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.setPrecompiledTransferStatus.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPrecompiledTransferStatus.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPrecompiledMock).interfaceId;
    }
}

contract PrecompiledMockFacetTimeTravel is TimeTravelStorageWrapper, PrecompiledMockFacet {}
