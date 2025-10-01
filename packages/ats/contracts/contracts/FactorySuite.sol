// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
import { IAtsFactory, AtsFactoryRegulationData } from "./interfaces/IFactorySuite.sol";
import { DEPLOYER_ROLE } from "./constants/roles.sol";
import { FactorySuiteStorageWrapper } from "./FactorySuiteStorageWrapper.sol";
// solhint-enable max-line-length

/**
 * @title FactorySuite
 * @notice Deploys an atomic suite of Bond, Treasury, and Kpi contracts with pre-flight validation
 */
abstract contract FactorySuite is FactorySuiteStorageWrapper, AtsCommon, ReentrancyGuard {
    using Address for address;

    /**
     * @dev Validates that an address is a contract
     * @param addr The address to validate
     */
    modifier validContractAddress(address addr) {
        if (!addr.isContract()) revert InvalidContractAddress(addr);
        _;
    }

    /**
     * @notice Validates treasury data parameters
     * @param treasuryData Treasury configuration to validate
     */
    modifier validTreasuryData(TreasuryData calldata treasuryData) {
        if (address(treasuryData.resolver) == address(0)) revert InvalidTreasuryData();
        if (treasuryData.paymentToken == address(0)) revert InvalidTreasuryData();

        // Validate all ERC721 addresses are non-zero (empty array is allowed)
        for (uint256 i = 0; i < treasuryData.erc721s.length; ++i) {
            if (treasuryData.erc721s[i] == address(0)) revert InvalidTreasuryData();
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
        returns (address bondAddress, address treasuryAddress, address KpiAddress)
    {
        KpiAddress = _deployKpiContract(kpiData);

        bondAddress = _deployBondContract(bondFactoryAddress, bondData, factoryRegulationData, KpiAddress);

        treasuryAddress = _deployTreasuryContract(treasuryData, bondAddress);

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
    }
}
