// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { IBusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { IFactory as IAtsFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";
import { FactoryRegulationData as AtsFactoryRegulationData } from "@hashgraph/asset-tokenization-contracts/contracts/layer_3/constants/regulation.sol";
// solhint-enable max-line-length

/**
 * @title IFactorySuite
 * @dev Interface for the Factory Suite smart contract
 * @notice Central deployment mechanism for atomic Bond + Treasury + KPI contract creation
 */
interface IFactorySuite {
    /**
     * @dev Configuration data for Treasury contract deployment as per ADR
     * @param resolver Business Logic Resolver for diamond pattern
     * @param resolverProxyConfiguration Proxy configuration settings
     * @param rbacs Role-based access control configurations
     * @param paymentToken Payment token address for transactions
     * @param environmentalAssets Array of environmental asset token addresses for portfolio
     */
    struct TreasuryData {
        IBusinessLogicResolver resolver;
        IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration;
        IResolverProxy.Rbac[] rbacs;
        address paymentToken;
        address[] environmentalAssets;
    }

    /**
     * @dev Emitted when a complete bond suite is deployed
     * @param operator Address that initiated the deployment (must have DEPLOYER role)
     * @param bondAddress Address of the deployed Bond contract with integrated KPI
     * @param treasuryAddress Address of the deployed Treasury contract
     * @param bondKpiData Bond KPI Linked Rate configuration data used for deployment
     * @param treasuryData Treasury configuration data used for deployment
     */
    event BondSuiteDeployed(
        address indexed operator,
        address indexed bondAddress,
        address indexed treasuryAddress,
        IAtsFactory.BondKpiLinkedRateData bondKpiData,
        TreasuryData treasuryData
    );

    /**
     * @dev Thrown when Bond contract deployment fails
     */
    error BondDeploymentFailed();

    /**
     * @dev Thrown when Treasury contract deployment fails
     */
    error TreasuryDeploymentFailed();

    /**
     * @dev Thrown when invalid treasury data is provided
     */
    error InvalidTreasuryData();

    /**
     * @dev Thrown when an address is not a valid contract
     * @param provided The address that was provided but is not a contract
     */
    error InvalidContractAddress(address provided);

    /**
     * @dev Deploys a complete bond suite (Bond with integrated KPI + Treasury) atomically
     * @param bondFactoryAddress Address of the ATS Bond Factory contract
     * @param bondKpiData Bond KPI Linked Rate configuration data (includes bondData and factoryRegulationData)
     * @param treasuryData Configuration data for the Treasury contract
     * @return bondAddress Address of the deployed Bond contract with integrated KPI
     * @return treasuryAddress Address of the deployed Treasury contract
     *
     * Requirements:
     * - Caller must have DEPLOYER role
     * - Contract must not be paused
     * - Bond factory address must be a valid contract
     * - Treasury data must be valid (non-zero resolver, payment token)
     * - Both contracts must deploy successfully (atomicity)
     * - All addresses in configuration must be non-zero contracts
     *
     * Emits: BondSuiteDeployed
     */
    function deployBondSuite(
        address bondFactoryAddress,
        IAtsFactory.BondKpiLinkedRateData calldata bondKpiData,
        TreasuryData calldata treasuryData
    ) external returns (address bondAddress, address treasuryAddress);
}
