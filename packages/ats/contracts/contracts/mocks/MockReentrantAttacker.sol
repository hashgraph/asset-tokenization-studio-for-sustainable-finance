// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { IFactorySuite, IAtsFactory } from "../interfaces/IFactorySuite.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { MockBond } from "./MockBond.sol";

/**
 * @title MockReentrantFactory
 * @notice Mock factory that attempts to perform a reentrancy attack on FactorySuite.deployBondSuite
 * @dev Used for testing the nonReentrant modifier effectiveness
 */
contract MockReentrantFactory {
    IFactorySuite public factorySuite;
    IAtsFactory.BondKpiLinkedRateData public storedBondKpiData;
    IFactorySuite.TreasuryData public storedTreasuryData;
    bool public shouldAttemptReentrancy;
    bool public reentrancyAttempted;

    constructor() {}

    /**
     * @notice Sets the factory suite address for reentrancy attack
     */
    function setFactorySuite(address _factorySuite) external {
        factorySuite = IFactorySuite(_factorySuite);
    }

    /**
     * @notice Enables reentrancy attack mode
     */
    function enableReentrancy(
        IAtsFactory.BondKpiLinkedRateData calldata _bondKpiData,
        IFactorySuite.TreasuryData calldata _treasuryData
    ) external {
        shouldAttemptReentrancy = true;
        storedBondKpiData = _bondKpiData;
        storedTreasuryData = _treasuryData;
        reentrancyAttempted = false;
    }

    /**
     * @notice Mock implementation of deployBondKpiLinkedRate that attempts reentrancy
     * @dev This is called by FactorySuite during deployBondSuite execution
     */
    function deployBondKpiLinkedRate(
        IAtsFactory.BondKpiLinkedRateData calldata /* bondKpiData */
    ) external returns (address bondAddress) {
        // Deploy a mock bond with minimal parameters
        IResolverProxy.Rbac[] memory emptyRbacs = new IResolverProxy.Rbac[](0);
        MockBond bond = new MockBond("Mock Bond", "MB", emptyRbacs);
        bondAddress = address(bond);

        // Attempt reentrancy if enabled
        if (shouldAttemptReentrancy && !reentrancyAttempted) {
            reentrancyAttempted = true;
            // This should fail due to ReentrancyGuard
            factorySuite.deployBondSuite(address(this), storedBondKpiData, storedTreasuryData);
        }

        return bondAddress;
    }
}
