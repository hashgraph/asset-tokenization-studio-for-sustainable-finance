// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { ResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/resolver/resolverProxy/ResolverProxy.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import {
    _DEFAULT_ADMIN_ROLE,
    _MATURITY_REDEEMER_ROLE
} from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/constants/roles.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_0/common/Common.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IFactorySuite, IAtsFactory, AtsFactoryRegulationData } from "../interfaces/IFactorySuite.sol";
import { ILifeCycleCashFlow } from "@hashgraph/green-bonds-platform-treasury-contracts/contracts/interfaces/ILifeCycleCashFlow.sol";
import { IPortfolio } from "@hashgraph/green-bonds-platform-treasury-contracts/contracts/interfaces/IPortfolio.sol";
// solhint-enable max-line-length

/**
 * @title FactorySuiteStorageWrapper
 * @notice Storage wrapper with deployment and configuration logic for FactorySuite
 */
abstract contract FactorySuiteStorageWrapper is AtsCommon {
    /**
     * @notice Deploys the Bond contract with integrated KPI using the ATS Bond Factory implementation
     * @param bondFactoryAddress Address of the ATS Bond Factory contract
     * @param bondKpiData Bond KPI Linked Rate configuration data (includes bondData and factoryRegulationData)
     * @return bondAddress Address of the deployed Bond contract with integrated KPI
     */
    function _deployBondContract(
        address bondFactoryAddress,
        IAtsFactory.BondKpiLinkedRateData calldata bondKpiData
    ) internal returns (address bondAddress) {
        uint256 originalLength = bondKpiData.bondData.security.rbacs.length;

        IResolverProxy.Rbac[] memory rbacs = new IResolverProxy.Rbac[](originalLength + 1);
        uint256 finalLength = 0;
        bool adminFound = false;

        for (uint256 i = 0; i < originalLength; i++) {
            IResolverProxy.Rbac memory currentRbac = bondKpiData.bondData.security.rbacs[i];

            if (currentRbac.role == _DEFAULT_ADMIN_ROLE) {
                adminFound = true;
                address[] memory newMembers = new address[](currentRbac.members.length + 1);
                for (uint256 j = 0; j < currentRbac.members.length; j++) {
                    newMembers[j] = currentRbac.members[j];
                }
                newMembers[currentRbac.members.length] = address(this);
                rbacs[finalLength++] = IResolverProxy.Rbac({ role: _DEFAULT_ADMIN_ROLE, members: newMembers });
            } else {
                rbacs[finalLength++] = currentRbac;
            }
        }

        if (!adminFound) {
            address[] memory adminMembers = new address[](1);
            adminMembers[0] = address(this);
            rbacs[finalLength++] = IResolverProxy.Rbac({ role: _DEFAULT_ADMIN_ROLE, members: adminMembers });
        }

        if (adminFound) {
            assembly {
                mstore(rbacs, finalLength) // Resize array if ADMIN was found (we allocated one extra slot)
            }
        }

        IAtsFactory.BondKpiLinkedRateData memory modifiedBondKpiData = bondKpiData;
        modifiedBondKpiData.bondData.security.rbacs = rbacs;

        IAtsFactory bondFactory = IAtsFactory(bondFactoryAddress);
        try bondFactory.deployBondKpiLinkedRate(modifiedBondKpiData) returns (address deployedBondAddress) {
            bondAddress = deployedBondAddress;
        } catch {
            revert IFactorySuite.BondDeploymentFailed();
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
        IFactorySuite.TreasuryData calldata treasuryData,
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
     * @notice Configures the Treasury contract with lifecycle and portfolio initialization
     * @param treasuryAddress Address of the deployed Treasury contract
     * @param treasuryData Treasury configuration data
     * @param bondAddress Address of the deployed Bond contract
     */
    function _configureTreasuryContract(
        address treasuryAddress,
        IFactorySuite.TreasuryData calldata treasuryData,
        address bondAddress
    ) internal {
        ILifeCycleCashFlow(treasuryAddress).initialize_LifeCycleCashFlow(bondAddress);
        IPortfolio(treasuryAddress).initialize_Portfolio(treasuryData.paymentToken, treasuryData.environmentalAssets);

        IAccessControl(bondAddress).grantRole(_MATURITY_REDEEMER_ROLE, treasuryAddress);
        IAccessControl(bondAddress).revokeRole(_DEFAULT_ADMIN_ROLE, address(this));
    }
}
