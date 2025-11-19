// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title PaymentTokenMock
 * @notice Mock ERC20 token for testing Treasury contracts
 * @dev Allows unrestricted minting with configurable decimals
 */
contract PaymentTokenMock is ERC20 {
    uint8 private _decimals;
    bool private _transferFromFail;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setTransferFromFail(bool transferFromFail_) external {
        _transferFromFail = transferFromFail_;
    }

    function getTransferFromFail() external view returns (bool) {
        return _transferFromFail;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        if (_transferFromFail) return false;
        return super.transferFrom(from, to, amount);
    }

    function approveFor(address owner, address spender, uint256 amount) public virtual returns (bool) {
        _approve(owner, spender, amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return ERC20.balanceOf(account);
    }
}
