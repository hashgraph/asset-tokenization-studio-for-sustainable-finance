// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;
// solhint-disable max-line-length

bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;

// keccak256('green.bonds.treasury.role.pauser');
bytes32 constant _PAUSER_ROLE = 0xf023e2d8253f7bbe212713d70a1babc4fc8b7e771b9775af6ca3946d75ba0424;

// keccak256('green.bonds.treasury.role.payout');
bytes32 constant _PAYOUT_ROLE = 0xebf5ca6d26cc22c22e444f1310234b08d29af96637704a9c32e34514ed6d5d64;

// keccak256('green.bonds.treasury.role.cashout');
bytes32 constant _CASHOUT_ROLE = 0xd6dc0d0f1a2211626cdc0f93236645be91942de00fabeebb70822a81bd65431d;
