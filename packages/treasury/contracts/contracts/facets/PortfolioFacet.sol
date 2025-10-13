// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {Portfolio} from '../Portfolio.sol';
import {IPortfolio} from '../interfaces/IPortfolio.sol';
import {PORTFOLIO_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';

contract PortfolioFacet is Portfolio, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = PORTFOLIO_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors)
    {
        uint256 selectorIndex;
        staticFunctionSelectors = new bytes4[](3);
        staticFunctionSelectors[selectorIndex++] = this
            .initialize_Portfolio
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .addEnvironmentalAssetToken
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .removeEnvironmentalAssetToken
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .updatePaymentToken
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .dissociateToken
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .getTotalEnvironmentalAssetTokens
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .getEnvironmentalAssetTokens
            .selector;
        staticFunctionSelectors[selectorIndex++] = this
            .getPaymentToken
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds)
    {
        staticInterfaceIds = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds[selectorsIndex++] = type(IPortfolio).interfaceId;
    }
}
