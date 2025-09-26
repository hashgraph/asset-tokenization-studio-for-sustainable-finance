// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title MockBusinessLogicResolver
 * @notice Simplified mock implementation of Business Logic Resolver for testing
 */
contract MockBusinessLogicResolver {
    mapping(bytes32 => address) private implementations;

    function setImplementation(bytes32 key, address implementation) external {
        implementations[key] = implementation;
    }

    function getImplementation(bytes32 key) external view returns (address) {
        return implementations[key];
    }
}