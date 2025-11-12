// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { IFactoryPrimaryMarket } from "../interfaces/IFactoryPrimaryMarket.sol";
import { FactoryPrimaryMarketStorageWrapper } from "./FactoryPrimaryMarketStorageWrapper.sol";
import { _DEFAULT_ADMIN_ROLE } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/constants/roles.sol";
import { IBusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { IFactory as IAtsFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";
import { PM_DEPLOYER_ROLE } from "../constants/roles.sol";

abstract contract FactoryPrimaryMarket is IFactoryPrimaryMarket, FactoryPrimaryMarketStorageWrapper {
    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        bool adminFound;

        // Looking for admin role within initialization rbacas in order to add the factory
        for (uint256 rbacsIndex = 0; rbacsIndex < rbacs.length; ++rbacsIndex) {
            if (rbacs[rbacsIndex].role == _DEFAULT_ADMIN_ROLE) {
                if (rbacs[rbacsIndex].members.length > 0) {
                    for (
                        uint256 adminMemberIndex = 0;
                        adminMemberIndex < rbacs[rbacsIndex].members.length;
                        ++adminMemberIndex
                    ) {
                        if (rbacs[rbacsIndex].members[adminMemberIndex] != address(0)) {
                            adminFound = true;
                            break;
                        }
                    }
                }
            }
            if (adminFound) {
                break;
            }
        }

        if (!adminFound) {
            revert NoInitialAdmins(rbacs);
        }
        _;
    }

    modifier checkResolver(IBusinessLogicResolver resolver) {
        address resolverAddress = address(resolver);
        if (resolverAddress == address(0)) {
            revert InvalidResolverAddress(resolverAddress);
        }
        _;
    }

    function deployPrimaryMarket(
        IBusinessLogicResolver resolver,
        IAtsFactory.ResolverProxyConfiguration calldata resolverProxyConfiguration,
        IResolverProxy.Rbac[] calldata rbacs
    )
        external
        onlyUnpaused
        onlyRole(PM_DEPLOYER_ROLE)
        checkResolver(resolver)
        checkAdmins(rbacs)
        returns (address primaryMarketAddress)
    {
        return _deployPrimaryMarket(resolver, resolverProxyConfiguration, rbacs);
    }
}
