// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {LifeCycleCashFlow} from '../LifeCycleCashFlow.sol';
import {ILifeCycleCashFlow} from '../interfaces/ILifeCycleCashFlow.sol';
import {
    _LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY
} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';

contract LifeCycleCashFlowFacet is LifeCycleCashFlow, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this
            .executeDistribution
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .executeDistributionByAddresses
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .executeBondCashOut
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .executeBondCashOutByAddresses
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAsset.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ILifeCycleCashFlow)
            .interfaceId;
    }
}
