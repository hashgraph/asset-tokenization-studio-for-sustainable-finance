// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title MockBusinessLogicResolver
 * @notice Simplified mock implementation of Business Logic Resolver for testing
 * @dev Uses simple mapping for key-value storage without validation
 */
contract MockBusinessLogicResolver {
    mapping(bytes32 => address) private _implementations;

    function setImplementation(bytes32 key, address implementation) external {
        _implementations[key] = implementation;
    }

    function getImplementation(bytes32 key) external view returns (address) {
        return _implementations[key];
    }
}
