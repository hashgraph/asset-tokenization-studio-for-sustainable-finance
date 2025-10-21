// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { IBusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { IFactory as IAtsFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";

/// @title Primary Market Factory Interface
/// @notice Defines the interface for deploying primary market contracts
interface IFactoryPrimaryMarket {
    /**
     * @notice Emitted when a new Primary Market contract is deployed
     * @param operator The address that initiated the deployment
     * @param resolver The business logic resolver associated with the deployed Primary Market
     * @param resolverProxyConfiguration The configuration used for the resolver proxy
     * @param rbacs Array of RBAC (Role-Based Access Control) configurations applied to the resolver proxy
     */
    event PrimaryMarketDeployed(
        address indexed operator,
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration,
        IResolverProxy.Rbac[] rbacs
    );

    /**
     * @notice Deploys a new Primary Market contract using the provided resolver and configuration
     * @dev Implementing contracts should deploy and configure a Primary Market instance,
     *      emit {PrimaryMarketDeployed}, and return or track the deployed contract address if applicable.
     * @param resolver The business logic resolver to associate with the deployed Primary Market
     * @param resolverProxyConfiguration The configuration to apply to the primary market resolver proxy
     * @param rbacs The initial roles setup for the primary market
     */
    function deployPrimaryMarket(
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration,
        IResolverProxy.Rbac[] rbacs
    ) external;
}
