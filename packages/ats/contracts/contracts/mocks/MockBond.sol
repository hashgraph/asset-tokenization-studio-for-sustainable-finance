// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title MockBond
 * @notice Minimal mock bond contract for testing FactorySuite deployment
 * @dev Used by MockAtsFactory to simulate bond contract creation
 */
contract MockBond {
    string public name = "Mock Bond";
    string public symbol = "MBOND";

    // solhint-disable-next-line no-empty-blocks
    constructor() {}
}
