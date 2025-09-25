// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IFactorySuite} from './interfaces/IFactorySuite.sol';
import {KPI} from './KPI.sol';
import {ProxyAdmin} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {TransparentUpgradeableProxy} from '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';
import {IFactory} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol';
import {AccessControl} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol';

// TODO: Import FactorySuiteLib when implemented
// import { FactorySuiteLib } from "./libraries/FactorySuiteLib.sol";

contract FactorySuite is IFactorySuite, AccessControl {
    function deployBondSuite(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData,
        TreasuryData calldata _treasuryData,
        KPIData calldata _kpiData
    )
        external
        onlyRole(DEPLOYER_ROLE)
        onlyUnpaused
        returns (
            address bondAddress_,
            address treasuryAddress_,
            address KPIAddress_
        )
    {
        // TODO: Add validation when FactorySuiteLib is implemented
        // FactorySuiteLib.validateTreasuryData(_treasuryData);
        // FactorySuiteLib.validateKPIData(_kpiData);

        // STEP 1: Deploy Bond using existing ATS Bond Factory
        IBondFactory bondFactory = IBondFactory(
            _factoryRegulationData.factoryAddress
        );
        try bondFactory.deployBond(_bondData, _factoryRegulationData) returns (
            address bondAddress
        ) {
            bondAddress_ = bondAddress;
        } catch {
            revert IFactorySuite.BondDeploymentFailed();
        }
        // STEP 2: Deploy Treasury contract
        // TODO: Use actual Treasury Factory when available
        // For now, placeholder deployment
        treasuryAddress_ = _deployTreasury(_treasuryData);

        // STEP 3: Deploy KPI contract with TUP+PA pattern
        KPIAddress_ = _deployKPI(_kpiData);

        // Validate all deployments succeeded
        if (bondAddress_ == address(0)) {
            revert IFactorySuite.BondDeploymentFailed();
        }
        if (treasuryAddress_ == address(0)) {
            revert IFactorySuite.TreasuryDeploymentFailed();
        }
        if (KPIAddress_ == address(0)) {
            revert IFactorySuite.KPIDeploymentFailed();
        }

        emit BondSuiteDeployed(
            msg.sender,
            bondAddress_,
            treasuryAddress_,
            KPIAddress_,
            _bondData,
            _factoryRegulationData,
            _treasuryData,
            _kpiData
        );

        return (bondAddress_, treasuryAddress_, KPIAddress_);
    }

    /**
     * @dev Deploy KPI contract with Transparent Upgradeable Proxy pattern
     * @param _kpiData KPI configuration data containing admin and RBAC settings
     * @return kpiAddress_ Address of the deployed KPI proxy contract
     */
    function _deployKPI(
        KPIData calldata _kpiData
    ) internal returns (address kpiAddress_) {
        // Deploy KPI logic contract
        KPI kpiLogic = new KPI();

        // Deploy ProxyAdmin with specified admin
        ProxyAdmin proxyAdmin = new ProxyAdmin();
        proxyAdmin.transferOwnership(_kpiData.admin);

        // Deploy TransparentUpgradeableProxy with initialize call
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(kpiLogic),
            address(proxyAdmin),
            abi.encodeWithSignature('initialize()')
        );

        kpiAddress_ = address(proxy);

        // Configure RBAC roles on the deployed KPI contract
        // TODO: Implement RBAC configuration when IResolverProxy interface is available
        // KPI kpiContract = KPI(kpiAddress_);
        // for (uint256 i = 0; i < _kpiData.rbacs.length; i++) {
        //     // Configure role based on rbac configuration
        //     // Example: kpiContract.grantRole(_kpiData.rbacs[i].role, _kpiData.rbacs[i].account);
        // }

        // Validate deployment succeeded
        if (kpiAddress_ == address(0)) {
            revert IFactorySuite.KPIDeploymentFailed();
        }
    }

    // ============ PLACEHOLDER DEPLOYMENT METHODS ============
    // These will be replaced when actual Treasury and KPI factories are implemented

    /**
     * @dev Placeholder Treasury deployment - will be replaced with actual Treasury Factory call
     * @param _treasuryData Treasury configuration data
     * @return treasuryAddress_ Address of the deployed Treasury contract
     */
    function _deployTreasury(
        TreasuryData calldata _treasuryData
    ) external returns (address treasuryAddress_) {
        // TODO: Replace with actual Treasury Factory deployment
        // For now, create deterministic address based on input data
        treasuryAddress_ = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            'treasury',
                            address(_treasuryData.resolver),
                            _treasuryData.paymentToken,
                            block.timestamp
                        )
                    )
                )
            )
        );

        // Placeholder validation - ensure non-zero address
        require(treasuryAddress_ != address(0), 'Treasury deployment failed');
    }
}
