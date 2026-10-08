// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IFactorySuite, IAtsFactory, AtsFactoryRegulationData } from "../interfaces/IFactorySuite.sol";
import { DEPLOYER_ROLE } from "../constants/roles.sol";
import { FactorySuiteStorageWrapper } from "./FactorySuiteStorageWrapper.sol";
// solhint-enable max-line-length

/**
 * @title FactorySuite
 * @notice Deploys an atomic suite of Bond, Treasury, and Kpi contracts with pre-flight validation
 */
abstract contract FactorySuite is FactorySuiteStorageWrapper, IFactorySuite, ReentrancyGuard {
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
        if (treasuryData.rbacs.length == 0) revert InvalidTreasuryData();

        // Validate all environmental asset addresses are non-zero (empty array is allowed)
        for (uint256 i = 0; i < treasuryData.environmentalAssets.length; ++i) {
            if (treasuryData.environmentalAssets[i] == address(0)) revert InvalidTreasuryData();
        }
        _;
    }

    /**
     * @notice Validates Bond KPI-linked rate data parameters
     * @param bondKpiData Bond configuration with KPI parameters to validate
     */
    modifier validBondKpiData(IAtsFactory.BondKpiLinkedRateData calldata bondKpiData) {
        // Validate interest rate: minRate <= baseRate <= maxRate
        if (bondKpiData.interestRate.minRate > bondKpiData.interestRate.baseRate) revert InvalidInterestRateValues();
        if (bondKpiData.interestRate.baseRate > bondKpiData.interestRate.maxRate) revert InvalidInterestRateValues();

        // Validate impact data: floor <= baseline <= cap
        if (bondKpiData.impactData.maxDeviationFloor > bondKpiData.impactData.baseLine)
            revert InvalidImpactDataValues();
        if (bondKpiData.impactData.baseLine > bondKpiData.impactData.maxDeviationCap) revert InvalidImpactDataValues();
        _;
    }

    function deployBondSuite(
        address bondFactoryAddress,
        IAtsFactory.BondKpiLinkedRateData calldata bondKpiData,
        TreasuryData calldata treasuryData
    )
        external
        nonReentrant
        onlyUnpaused
        onlyRole(DEPLOYER_ROLE)
        validContractAddress(bondFactoryAddress)
        validTreasuryData(treasuryData)
        validBondKpiData(bondKpiData)
        returns (address bondAddress, address treasuryAddress)
    {
        bondAddress = _deployBondContract(bondFactoryAddress, bondKpiData);

        treasuryAddress = _deployTreasuryContract(treasuryData, bondAddress);

        emit BondSuiteDeployed(_msgSender(), bondAddress, treasuryAddress, bondKpiData, treasuryData);
    }
}
