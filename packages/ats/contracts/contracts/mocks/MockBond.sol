// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title MockBond
 * @notice Minimal mock bond contract for testing FactorySuite deployment
 * @dev Used by MockAtsFactory to create deployable bond contracts in tests
 */
contract MockBond {
    string public name = "Mock Bond";
    string public symbol = "MBOND";

    /**
     * @notice Mock bond is deployed successfully
     */
    constructor() {
        // Minimal implementation - just needs to be a deployable contract
    }
}
