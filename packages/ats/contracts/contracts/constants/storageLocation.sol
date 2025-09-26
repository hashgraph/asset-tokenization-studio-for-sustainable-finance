// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// keccak256(abi.encode(uint256(keccak256("kpi.storage.main")) - 1)) & ~bytes32(uint256(0xff))
bytes32 constant _MAIN_STORAGE_LOCATION = 0x7951b57d34492147b02ce280f4a5a3e267a90c41bb73a92f7e5957582ef3b4cc;