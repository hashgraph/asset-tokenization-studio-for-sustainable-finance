// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { IBusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { IFactory as IAtsFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";

interface IFactoryPrimaryMarket {
    event PrimaryMarketDeployed(
        address indexed operator,
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration,
        IResolverProxy.Rbac[] rbacs
    );
    function deployPrimaryMarket(
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration,
        IResolverProxy.Rbac[] rbacs
    ) external;
}
