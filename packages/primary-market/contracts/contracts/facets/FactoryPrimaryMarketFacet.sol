// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { FACTORY_PRIMARY_MARKET_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { FactoryPrimaryMarket } from "./FactoryPrimaryMarket.sol";
import { IFactoryPrimaryMarket } from "../interfaces/IFactoryPrimaryMarket.sol";

contract FactoryPrimaryMarketFacet is IStaticFunctionSelectors, FactoryPrimaryMarket {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey) {
        staticResolverKey = FACTORY_PRIMARY_MARKET_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors) {
        staticFunctionSelectors = new bytes4[](1);
        uint256 selectorIndex = 0;

        staticFunctionSelectors[selectorIndex++] = this.deployPrimaryMarket.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds) {
        staticInterfaceIds = new bytes4[](1);
        staticInterfaceIds[0] = type(IFactoryPrimaryMarket).interfaceId;
    }
}
