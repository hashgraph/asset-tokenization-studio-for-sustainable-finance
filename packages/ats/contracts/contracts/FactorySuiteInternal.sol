// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {ProxyAdmin} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {TransparentUpgradeableProxy} from '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';
import {ResolverProxy} from '@hashgraph/asset-tokenization-contracts/contracts/resolver/resolverProxy/ResolverProxy.sol';
import {
    IFactorySuite,
    IResolverProxy,
    IAtsFactory,
    AtsFactoryRegulationData
} from './interfaces/IFactorySuite.sol';
import {Kpi} from './Kpi.sol';
import {IKpi} from './interfaces/IKpi.sol';
// solhint-enable max-line-length

/**
 * @title FactorySuiteInternal
 * @notice Internal deployment and configuration logic for FactorySuite
 */
abstract contract FactorySuiteInternal is IFactorySuite {

    /**
     * @notice Deploys the Bond contract using the ATS Bond Factory implementation
     * @dev TODO: When interest/coupon system is implemented, this function will need to receive
     *      the KPI contract address to link variable-rate bonds with their Oracle data source.
     *      This might be through Bond initialization or another mechanism.
     * @param bondFactoryAddress Address of the ATS Bond Factory contract
     * @param bondData Bond configuration data
     * @param factoryRegulationData Regulation data for compliance
     * @return bondAddress Address of the deployed Bond contract
     */
    function _deployBondContract(
        address bondFactoryAddress,
        IAtsFactory.BondData calldata bondData,
        AtsFactoryRegulationData calldata factoryRegulationData
    ) internal returns (address bondAddress) {
        IAtsFactory bondFactory = IAtsFactory(bondFactoryAddress);
        try bondFactory.deployBond(bondData, factoryRegulationData) returns (
            address deployedBondAddress
        ) {
            bondAddress = deployedBondAddress;
        } catch {
            revert BondDeploymentFailed();
        }
    }

    /**
     * @notice Deploys the Treasury contract using ResolverProxy pattern
     * @dev TODO: Treasury initialization requires the Bond contract address to manage lifecycle
     *      obligations (coupon distributions and redemptions). This will be implemented when
     *      the Treasury contract interface is available.
     * @param treasuryData Treasury configuration data
     * @return treasuryAddress Address of the deployed Treasury contract
     */
    function _deployTreasuryContract(
        TreasuryData calldata treasuryData
    ) internal returns (address treasuryAddress) {
        // Deploy Treasury contract using ResolverProxy pattern (similar to ATS Factory)
        // TODO: check if can be extracted to shared/contracts-core
        ResolverProxy treasuryProxy = new ResolverProxy(
            treasuryData.resolver,
            treasuryData.resolverProxyConfiguration.key,
            treasuryData.resolverProxyConfiguration.version,
            treasuryData.rbacs
        );

        treasuryAddress = address(treasuryProxy);

        // Configure Treasury with payment token and environmental assets portfolio
        _configureTreasuryContract(treasuryAddress, treasuryData);
    }

    /**
     * @notice Deploys the Kpi contract using the Transparent Upgradeable Proxy pattern
     * @param kpiData Kpi configuration data containing admin and RBAC settings
     * @return KpiAddress Address of the deployed Kpi proxy contract
     */
    function _deployKpiContract(
        KpiData calldata kpiData
    ) internal returns (address KpiAddress) {
        // Deploy Kpi logic contract
        Kpi KpiLogic = new Kpi();

        // Deploy ProxyAdmin with specified admin
        ProxyAdmin proxyAdmin = new ProxyAdmin();
        proxyAdmin.transferOwnership(kpiData.admin);

        // Deploy TransparentUpgradeableProxy with initialize call
        // RBAC roles are configured during initialization via the initialize() function
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(KpiLogic),
            address(proxyAdmin),
            abi.encodeWithSelector(IKpi.initialize.selector, kpiData.rbacs)
        );

        KpiAddress = address(proxy);
    }

    /**
     * @notice Configures the Treasury contract with payment token and environmental assets
     * @param treasuryAddress Address of the deployed Treasury contract
     * @param treasuryData Treasury configuration data
     */
    function _configureTreasuryContract(
        address treasuryAddress,
        TreasuryData calldata treasuryData
    ) internal {
        // solhint-disable-next-line no-empty-blocks
        // TODO: Implement Treasury configuration when Treasury contract interface is available
        // Configuration will include:
        // - Setting the Bond contract address (required for lifecycle operations)
        // - Setting payment token for coupon/redemption distributions
        // - Configuring ERC721 portfolio for environmental assets
        // - Setting up fund allocation capabilities
        // - Configuring lifecycle obligation management
    }
}