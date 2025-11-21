// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { IBusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { IFactory as IAtsFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";
import { ResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/resolver/resolverProxy/ResolverProxy.sol";
import { IFactoryPrimaryMarket } from "../interfaces/IFactoryPrimaryMarket.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
// solhint-enable max-line-length

contract FactoryPrimaryMarketStorageWrapper is AtsCommon {
    function _deployPrimaryMarket(
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration calldata resolverProxyConfiguration,
        IResolverProxy.Rbac[] calldata rbacs
    ) internal returns (address primaryMarketAddress) {
        ResolverProxy primaryMarketProxy = new ResolverProxy(
            resolver,
            resolverProxyConfiguration.key,
            resolverProxyConfiguration.version,
            rbacs
        );

        primaryMarketAddress = address(primaryMarketProxy);

        emit IFactoryPrimaryMarket.PrimaryMarketDeployed(
            _msgSender(),
            primaryMarketAddress,
            resolver,
            resolverProxyConfiguration,
            rbacs
        );
    }
}
