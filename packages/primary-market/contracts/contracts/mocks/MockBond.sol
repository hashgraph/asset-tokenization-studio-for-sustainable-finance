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
    uint8 public nominalValueDecimals;
    mapping(address => uint256) private _balance;
    uint256 private _totalSupply;
    uint8 private _decimals;

    error NotImplemented();

    constructor(
        string memory name_,
        string memory symbol_,
        address treasury_,
        uint256 nominalValue_,
        uint8 nominalValueDecimals_,
        uint8 decimals_
    ) {
        name = name_;
        symbol = symbol_;
        treasury = treasury_;
        // For simplicity in tests, we use 1 to mean 0.1 USDC per 10^12 bond wei
        nominalValue = nominalValue_; // This means subscriptionAmount (in wei) * 1 = payment (in smallest unit)
        nominalValueDecimals = nominalValueDecimals_;
        _decimals = decimals_;
    }

    function setNominalValue(uint256 nominalValue_) external {
        nominalValue = nominalValue_;
    }

    function setNominalValueDecimals(uint8 nominalValueDecimals_) external {
        nominalValueDecimals = nominalValueDecimals_;
    }

    function issue(address _tokenHolder, uint256 _value, bytes calldata /*_data*/) external {
        _balance[_tokenHolder] += _value;
        _totalSupply += _value;
    }

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_ = BondDetailsData({
            currency: bytes3("USD"),
            nominalValue: nominalValue,
            nominalValueDecimals: nominalValueDecimals,
            startingDate: block.timestamp,
            maturityDate: block.timestamp + 365 days
        });
    }

    function getTotalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function getBalanceOf(address account) external view returns (uint256) {
        return _balance[account];
    }

    function getCoupon(uint256) external pure override returns (RegisteredCoupon memory) {
        revert NotImplemented();
    }

    function getCouponFor(uint256, address) external pure override returns (CouponFor memory) {
        revert NotImplemented();
    }

    function getCouponAmountFor(uint256, address) external pure override returns (CouponAmountFor memory) {
        revert NotImplemented();
    }

    function getPrincipalFor(address) external pure returns (PrincipalFor memory) {
        revert NotImplemented();
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

    function getCouponFromOrderedListAt(uint256) external pure override returns (uint256) {
        return 0;
    }

    function getCouponsOrderedList(uint256, uint256) external pure override returns (uint256[] memory) {
        return new uint256[](0);
    }

    function getCouponsOrderedListTotal() external pure override returns (uint256) {
        return 0;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view override returns (uint256 couponID_) {}

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {}

    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {}
}
