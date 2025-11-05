// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";

/**
 * @title MockBond
 * @notice Mock bond contract for testing Primary Market
 * @dev Implements IBondRead interface with configurable nominal value
 */
contract MockBond is IBondRead {
    string public name;
    string public symbol;
    address public treasury;
    uint256 public nominalValue;
    mapping(address => uint256) balance;
    uint256 totalSupply;

    constructor(string memory name_, string memory symbol_, address treasury_) {
        name = name_;
        symbol = symbol_;
        treasury = treasury_;
        // For simplicity in tests, we use 1 to mean 1 USDC per 10^12 bond wei
        nominalValue = 3; // This means subscriptionAmount (in wei) * 1 = payment (in smallest unit)
    }

    function setNominalValue(uint256 nominalValue_) external {
        nominalValue = nominalValue_;
    }

    function issue(address _tokenHolder, uint256 _value, bytes calldata /*_data*/) external {
        balance[_tokenHolder] += _value;
        totalSupply += _value;
    }

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_ = BondDetailsData({
            currency: bytes3("USD"),
            nominalValue: nominalValue,
            startingDate: block.timestamp,
            maturityDate: block.timestamp + 365 days
        });
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function getBalanceOf(address account) external view returns (uint256) {
        return balance[account];
    }

    function getCoupon(uint256) external pure override returns (RegisteredCoupon memory) {
        revert("Not implemented");
    }

    function getCouponFor(uint256, address) external pure override returns (CouponFor memory) {
        revert("Not implemented");
    }

    function getCouponCount() external pure override returns (uint256) {
        return 0;
    }

    function getCouponHolders(uint256, uint256, uint256) external pure override returns (address[] memory) {
        return new address[](0);
    }

    function getTotalCouponHolders(uint256) external pure override returns (uint256) {
        return 0;
    }
}
