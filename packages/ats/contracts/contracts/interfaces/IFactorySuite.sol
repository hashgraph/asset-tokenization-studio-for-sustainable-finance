// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// TODO: Check import paths
import {IBusinessLogicResolver} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/IBusinessLogicResolver.sol';
import {
    BondData,
    FactoryRegulationData
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol';

/**
 * @title IFactorySuite
 * @dev Interface for the Factory Suite smart contract
 * @notice Central deployment mechanism for atomic Bond + Treasury + KPI contract creation
 */
interface IFactorySuite {
    // ============ STRUCTS ============

    /**
     * @dev Configuration data for Treasury contract deployment as per ADR
     * @param resolver Business Logic Resolver for diamond pattern
     * @param resolverProxyConfiguration Proxy configuration settings
     * @param rbacs Role-based access control configurations
     * @param paymentToken ERC20 token address for payments
     * @param erc721s Array of ERC721 token addresses for environmental assets portfolio
     */
    struct TreasuryData {
        IBusinessLogicResolver resolver;
        ResolverProxyConfiguration resolverProxyConfiguration;
        IResolverProxy.Rbac[] rbacs;
        address paymentToken;
        address[] erc721s;
    }

    /**
     * @dev Configuration data for KPI contract deployment as per ADR
     * @param admin Proxy admin's admin address
     * @param rbacs Role-based access control configurations for KPI operations
     */
    struct KPIData {
        address admin;
        IResolverProxy.Rbac[] rbacs;
    }

    // ============ ERRORS ============

    /**
     * @dev Thrown when Bond contract deployment fails
     */
    error BondDeploymentFailed();

    /**
     * @dev Thrown when Treasury contract deployment fails
     */
    error TreasuryDeploymentFailed();

    /**
     * @dev Thrown when KPI contract deployment fails
     */
    error KPIDeploymentFailed();

    // ============ EVENTS ============

    /**
     * @dev Emitted when a complete bond suite is deployed
     * @param operator Address that initiated the deployment (must have DEPLOYER role)
     * @param bondAddress Address of the deployed Bond contract
     * @param treasuryAddress Address of the deployed Treasury contract
     * @param KPIAddress Address of the deployed KPI contract
     * @param bondData Bond configuration data used for deployment
     * @param factoryRegulationData Regulation data for the bond
     * @param treasuryData Treasury configuration data used for deployment
     * @param kpiData KPI configuration data used for deployment
     */
    event BondSuiteDeployed(
        address indexed operator,
        address bondAddress,
        address treasuryAddress,
        address KPIAddress,
        BondData bondData,
        FactoryRegulationData factoryRegulationData,
        TreasuryData treasuryData,
        KPIData kpiData
    );

    // ============ FUNCTIONS ============

    /**
     * @dev Deploys a complete bond suite (Bond + Treasury + KPI) atomically
     * @param _bondData Configuration data for the Bond contract
     * @param _factoryRegulationData Regulation data for compliance
     * @param _treasuryData Configuration data for the Treasury contract
     * @param _kpiData Configuration data for the KPI contract
     * @return bondAddress_ Address of the deployed Bond contract
     * @return treasuryAddress_ Address of the deployed Treasury contract
     * @return KPIAddress_ Address of the deployed KPI contract
     *
     * Requirements:
     * - Caller must have DEPLOYER role
     * - Contract must not be paused
     * - All configuration data must be valid
     * - All three contracts must deploy successfully (atomicity)
     *
     * Emits: BondSuiteDeployed
     */
    function deployBondSuite(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData,
        TreasuryData calldata _treasuryData,
        KPIData calldata _kpiData
    )
        external
        returns (
            address bondAddress_,
            address treasuryAddress_,
            address KPIAddress_
        );
}
