// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;
// solhint-disable max-line-length

bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

// keccak256('green.bonds.treasury.role.portfolio.manager');
bytes32 constant PORTFOLIO_MANAGER_ROLE = 0x8734926a1c1200d18e737f9b81dd7f424b59efc1eb35b9afb5fee0faa29e1077;

// keccak256('green.bonds.treasury.role.pauser');
bytes32 constant PAUSER_ROLE = 0xf023e2d8253f7bbe212713d70a1babc4fc8b7e771b9775af6ca3946d75ba0424;

// keccak256('green.bonds.treasury.role.funds.manager');
bytes32 constant FUNDS_MANAGER_ROLE = 0x5deab80f7dc81e163521c79bbbfc24cfe00f75f4ff7006e53789aae4b66755d4;

// keccak256('green.bonds.treasury.role.proceeds.full.manager');
bytes32 constant PROCEEDS_FULL_MANAGER = 0xc72c3e363e25be4f275bc99e815905b525be1cd147d9a2b9f05087df873b361d;
