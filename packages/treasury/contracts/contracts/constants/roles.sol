// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;
// solhint-disable max-line-length

bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

// keccak256('green.bonds.platform.treasury.role.portfolio.manager');
bytes32 constant PORTFOLIO_MANAGER_ROLE = 0xf8f1da56e510d0db422582238e75a932b72ae6165ad31a4c2eb993e0c9196a06;

// keccak256('green.bonds.platform.treasury.role.pauser');
bytes32 constant PAUSER_ROLE = 0x009b78205b2e54d760e90bc394bf2f4bc2eace88289a29610528ff12aaa13547;

// keccak256('green.bonds.platform.treasury.role.funds.manager');
bytes32 constant FUNDS_MANAGER_ROLE = 0x6b2cde3f3e0fdc0dee8b8dc6466157b675ab2b8465c45b8b9c4cf0049a93344d;

// keccak256('green.bonds.platform.treasury.role.proceeds.full.manager');
bytes32 constant PROCEEDS_FULL_MANAGER_ROLE = 0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5;
