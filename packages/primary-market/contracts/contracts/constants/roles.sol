// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
// solhint-disable max-line-length

/// @dev Role for deploying new bond suites - keccak256('green.bonds.platform.role.primary.market.deployer')
bytes32 constant PM_DEPLOYER_ROLE = 0x6317a0a54c6810764ed949f1fdb7c29121cbad7545dec2b713233501ad614b22;

/// @dev Role for creating offerings - keccak256('green.bonds.platform.role.primary.market.offering.creator')
bytes32 constant OFFERING_CREATOR_ROLE = 0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a;
