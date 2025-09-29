// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import {ProxyAdmin} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {TransparentUpgradeableProxy} from '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';
import {Common as AtsCommon} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';
import {
    IFactorySuite,
    IResolverProxy,
    IAtsFactory,
    AtsFactoryRegulationData
} from './interfaces/IFactorySuite.sol';
import {DEPLOYER_ROLE} from './constants/roles.sol';
import {Kpi} from './Kpi.sol';
import {IKpi} from './interfaces/IKpi.sol';
// solhint-enable max-line-length

/**
 * @title FactorySuite
 * @notice Deploys an atomic suite of Bond, Treasury, and Kpi contracts with pre-flight validation
 */
abstract contract FactorySuite is IFactorySuite, AtsCommon, ReentrancyGuard {
    using Address for address;

    // ============ MODIFIERS ============
    /**
     * @dev Validates that an address is not zero and is a contract
     * @param addr The address to validate
     */
    modifier validContractAddress(address addr) {
        if (addr == address(0)) revert ZeroAddressNotAllowed();
        if (!addr.isContract()) revert InvalidTreasuryData();
        _;
    }

    /**
     * @notice Validates treasury data parameters
     * @param treasuryData Treasury configuration to validate
     */
    modifier validTreasuryData(TreasuryData calldata treasuryData) {
        if (address(treasuryData.resolver) == address(0))
            revert InvalidTreasuryData();
        if (treasuryData.paymentToken == address(0))
            revert InvalidTreasuryData();
        if (treasuryData.erc721s.length == 0) revert EmptyArrayNotAllowed();

        // Validate all ERC721 addresses are non-zero
        for (uint256 i = 0; i < treasuryData.erc721s.length; ++i) {
            if (treasuryData.erc721s[i] == address(0))
                revert InvalidTreasuryData();
        }
        _;
    }

    /**
     * @notice Validates Kpi data parameters
     * @param kpiData Kpi configuration to validate
     */
    modifier validKpiData(KpiData calldata kpiData) {
        if (kpiData.admin == address(0)) revert InvalidKpiData();
        _;
    }

    // ============ External Functions ============

    function deployBondSuite(
        address bondFactoryAddress,
        IAtsFactory.BondData calldata bondData,
        AtsFactoryRegulationData calldata factoryRegulationData,
        TreasuryData calldata treasuryData,
        KpiData calldata kpiData
    )
        external
        nonReentrant
        onlyUnpaused
        onlyRole(DEPLOYER_ROLE)
        validContractAddress(bondFactoryAddress)
        validTreasuryData(treasuryData)
        validKpiData(kpiData)
        returns (
            address bondAddress,
            address treasuryAddress,
            address KpiAddress
        )
    {
        // STEP 1: Deploy Bond using existing ATS Bond Factory
        bondAddress = _deployBondContract(
            bondFactoryAddress,
            bondData,
            factoryRegulationData
        );
        // STEP 2: Deploy Treasury contract
        treasuryAddress = _deployTreasuryContract(treasuryData);

        // STEP 3: Deploy Kpi contract with TUP+PA pattern
        KpiAddress = _deployKpiContract(kpiData);

        // Final validation of all deployments
        _validateDeployments(bondAddress, treasuryAddress, KpiAddress);

        emit BondSuiteDeployed(
            msg.sender,
            bondAddress,
            treasuryAddress,
            KpiAddress,
            bondData,
            factoryRegulationData,
            treasuryData,
            kpiData
        );

        return (bondAddress, treasuryAddress, KpiAddress);
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
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(KpiLogic),
            address(proxyAdmin),
            abi.encodeWithSelector(IKpi.initialize.selector, kpiData.rbacs)
        );

        KpiAddress = address(proxy);

        // Configure RBAC roles on the deployed Kpi contract
        _configureKpiRoles(KpiAddress, kpiData.rbacs);
    }

    // ============ INTERNAL DEPLOYMENT METHODS ============

    /**
     * @notice Deploys the Bond contract using the ATS Bond Factory implementation
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
     * @notice Deploys the Treasury contract (placeholder implementation until factory is available)
     * @param treasuryData Treasury configuration data
     * @return treasuryAddress Address of the deployed Treasury contract
     */
    function _deployTreasuryContract(
        TreasuryData calldata treasuryData
    ) internal returns (address treasuryAddress) {
        // TODO: Replace with actual Treasury Factory deployment
        // For now, create deterministic address based on input data
        treasuryAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            'treasury',
                            address(treasuryData.resolver),
                            treasuryData.paymentToken,
                            block.timestamp
                        )
                    )
                )
            )
        );
    }

    /**
     * @notice Configures RBAC roles for the deployed Kpi contract (validation only until integration)
     * @param KpiAddress Address of the deployed Kpi contract
     * @param rbacs Array of RBAC configurations to apply
     */
    function _configureKpiRoles(
        address KpiAddress,
        IResolverProxy.Rbac[] calldata rbacs
    ) private {
        if (KpiAddress == address(0)) revert KpiDeploymentFailed();

        if (rbacs.length == 0) {
            return;
        }

        // TODO: Implement RBAC configuration when Kpi contract interface is standardized
    }

    /**
     * @notice Validates that all contract deployments were successful
     * @param bondAddress Address of the deployed Bond contract
     * @param treasuryAddress Address of the deployed Treasury contract
     * @param KpiAddress Address of the deployed Kpi contract
     */
    function _validateDeployments(
        address bondAddress,
        address treasuryAddress,
        address KpiAddress
    ) private view {
        if (bondAddress == address(0) || !bondAddress.isContract()) {
            revert BondDeploymentFailed();
        }
        if (treasuryAddress == address(0)) {
            revert TreasuryDeploymentFailed();
        }
        if (KpiAddress == address(0) || !KpiAddress.isContract()) {
            revert KpiDeploymentFailed();
        }
    }
}
