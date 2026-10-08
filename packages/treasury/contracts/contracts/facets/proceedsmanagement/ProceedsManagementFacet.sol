// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

// solhint-disable max-line-length

import { ProceedsManagement } from "./ProceedsManagement.sol";
import { IProceedsManagement } from "../../interfaces/IProceedsManagement.sol";
import { PROCEEDS_MANAGEMENT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

contract ProceedsManagementFacet is ProceedsManagement, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = PROCEEDS_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors) {
        uint256 selectorIndex;
        staticFunctionSelectors = new bytes4[](3);
        // solhint-disable gas-increment-by-one
        staticFunctionSelectors[selectorIndex++] = this.transferPaymentToken.selector;
        staticFunctionSelectors[selectorIndex++] = this.transferEnvironmentalAssetToken.selector;
        staticFunctionSelectors[selectorIndex++] = this.fundProceedsRecipient.selector;
        // solhint-enable gas-increment-by-one
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        uint256 selectorsIndex;
        // solhint-disable-next-line gas-increment-by-one
        staticInterfaceIds[selectorsIndex++] = type(IProceedsManagement).interfaceId;
    }
}
