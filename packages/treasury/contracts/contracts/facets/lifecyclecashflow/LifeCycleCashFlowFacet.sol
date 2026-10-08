// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

// solhint-disable max-line-length

import { LifeCycleCashFlow } from "./LifeCycleCashFlow.sol";
import { ILifeCycleCashFlow } from "../../interfaces/ILifeCycleCashFlow.sol";
import { LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

contract LifeCycleCashFlowFacet is LifeCycleCashFlow, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors) {
        uint256 selectorIndex = 0;
        staticFunctionSelectors = new bytes4[](6);
        // solhint-disable gas-increment-by-one
        staticFunctionSelectors[selectorIndex++] = this.initialize_LifeCycleCashFlow.selector;
        staticFunctionSelectors[selectorIndex++] = this.executeDistribution.selector;
        staticFunctionSelectors[selectorIndex++] = this.executeDistributionByAddresses.selector;
        staticFunctionSelectors[selectorIndex++] = this.executeBondRedemption.selector;
        staticFunctionSelectors[selectorIndex++] = this.executeBondRedemptionByAddresses.selector;
        staticFunctionSelectors[selectorIndex++] = this.getAsset.selector;
        // solhint-enable gas-increment-by-one
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        uint256 selectorsIndex;
        // solhint-disable-next-line gas-increment-by-one
        staticInterfaceIds[selectorsIndex++] = type(ILifeCycleCashFlow).interfaceId;
    }
}
