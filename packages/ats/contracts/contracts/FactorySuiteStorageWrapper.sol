// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { ResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/resolver/resolverProxy/ResolverProxy.sol";
import { IFactorySuite, IAtsFactory, AtsFactoryRegulationData } from "./interfaces/IFactorySuite.sol";
import { Kpi } from "./Kpi.sol";
import { IKpi } from "./interfaces/IKpi.sol";
// solhint-enable max-line-length

/**
 * @title FactorySuiteStorageWrapper
 * @notice Storage wrapper with deployment and configuration logic for FactorySuite
 */
abstract contract FactorySuiteStorageWrapper is IFactorySuite {
    /**
     * @notice Deploys the Bond contract using the ATS Bond Factory implementation
     * @dev KPI address parameter is reserved for future ATS Factory integration
     * @param bondFactoryAddress Address of the ATS Bond Factory contract
     * @param bondData Bond configuration data
     * @param factoryRegulationData Regulation data for compliance
     * @return bondAddress Address of the deployed Bond contract
     */
    function _deployBondContract(
        address bondFactoryAddress,
        IAtsFactory.BondData calldata bondData,
        AtsFactoryRegulationData calldata factoryRegulationData,
        address // kpiAddress - reserved for future use
    ) internal returns (address bondAddress) {
        IAtsFactory bondFactory = IAtsFactory(bondFactoryAddress);
        try bondFactory.deployBond(bondData, factoryRegulationData) returns (address deployedBondAddress) {
            bondAddress = deployedBondAddress;
        } catch {
            revert BondDeploymentFailed();
        }
    }

    /**
     * @notice Deploys the Treasury contract using ResolverProxy pattern
     * @dev Bond address parameter is included for Treasury initialization to manage lifecycle
     *      obligations (coupon distributions and redemptions). Implementation pending Treasury
     *      contract interface availability.
     * @param treasuryData Treasury configuration data
     * @param bondAddress Address of the deployed Bond contract
     * @return treasuryAddress Address of the deployed Treasury contract
     */
    function _deployTreasuryContract(
        TreasuryData calldata treasuryData,
        address bondAddress
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
        _configureTreasuryContract(treasuryAddress, treasuryData, bondAddress);
    }

    /**
     * @notice Deploys the Kpi contract using the Transparent Upgradeable Proxy pattern
     * @param kpiData Kpi configuration data containing admin and RBAC settings
     * @return KpiAddress Address of the deployed Kpi proxy contract
     */
    function _deployKpiContract(KpiData calldata kpiData) internal returns (address KpiAddress) {
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
     * @notice Configures the Treasury contract - implementation pending Treasury interface
     * @dev Parameters reserved for future Treasury configuration implementation
     */
    function _configureTreasuryContract(
        address, // treasuryAddress
        TreasuryData calldata, // treasuryData
        address // bondAddress
    ) internal {
        // solhint-disable-next-line no-empty-blocks
        // TODO: Implement when Treasury contract interface is available
    }
}
