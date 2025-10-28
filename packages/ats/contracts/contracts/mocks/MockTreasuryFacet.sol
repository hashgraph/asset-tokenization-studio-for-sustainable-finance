// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { IStaticFunctionSelectors } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { MOCK_TREASURY_RESOLVER_KEY } from "./constants/resolverKeys.sol";
// solhint-enable max-line-length

/**
 * @title MockTreasuryFacet
 * @notice Mock implementation of Treasury facet for testing FactorySuite deployment
 * @dev Implements initialization methods compatible with ILifeCycleCashFlow and IPortfolio
 */
contract MockTreasuryFacet is IStaticFunctionSelectors {
    /** Storage for tracking initialization state */
    bool public lifeCycleCashFlowInitialized;
    bool public portfolioInitialized;
    address public bondAddress;
    address public paymentToken;
    address[] public environmentalAssets;
    function getStaticResolverKey() external pure override returns (bytes32) {
        return MOCK_TREASURY_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](10);
        selectors[0] = this.getStaticResolverKey.selector;
        selectors[1] = this.getStaticFunctionSelectors.selector;
        selectors[2] = this.getStaticInterfaceIds.selector;
        selectors[3] = this.initialize_LifeCycleCashFlow.selector;
        selectors[4] = this.initialize_Portfolio.selector;
        selectors[5] = this.lifeCycleCashFlowInitialized.selector;
        selectors[6] = this.portfolioInitialized.selector;
        selectors[7] = this.bondAddress.selector;
        selectors[8] = this.paymentToken.selector;
        selectors[9] = this.getEnvironmentalAssetsCount.selector;
        return selectors;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        bytes4[] memory interfaceIds = new bytes4[](1);
        interfaceIds[0] = type(IStaticFunctionSelectors).interfaceId;
        return interfaceIds;
    }

    /** @notice Initialize lifecycle cash flow with bond address */
    function initialize_LifeCycleCashFlow(address bond) external {
        require(!lifeCycleCashFlowInitialized, "MockTreasuryFacet: lifecycle already initialized");
        lifeCycleCashFlowInitialized = true;
        bondAddress = bond;
    }

    /** @notice Initialize portfolio with payment token and environmental assets */
    function initialize_Portfolio(address _paymentToken, address[] memory _environmentalAssets) external {
        require(!portfolioInitialized, "MockTreasuryFacet: portfolio already initialized");
        portfolioInitialized = true;
        paymentToken = _paymentToken;
        for (uint256 i = 0; i < _environmentalAssets.length; i++) {
            environmentalAssets.push(_environmentalAssets[i]);
        }
    }

    /** @notice Get count of environmental assets */
    function getEnvironmentalAssetsCount() external view returns (uint256) {
        return environmentalAssets.length;
    }
}
