// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";

contract AssetMock is IBondRead {
    enum DateType {
        ZERO,
        TODAY,
        FUTURE
    }

    string internal _name = "Mock Bond";
    string internal _symbol = "MBOND";
    DateType internal _dateType;
    uint256 internal _amount;
    address[] internal _holders;
    bool internal _isProceedRecipientForTheBond;
    bool internal _decimalsObtained;

    error UnableToGetCouponHolders();
    error DecimalsNotObtained();

    // solhint-disable-next-line no-empty-blocks
    constructor(
        DateType date,
        uint256 amountToPay,
        address[] memory couponHolders,
        bool addressIsProceedRecipient,
        bool areDecimalsObtained
    ) {
        _dateType = date;
        _amount = amountToPay;
        _holders = couponHolders;
        _isProceedRecipientForTheBond = addressIsProceedRecipient;
        _decimalsObtained = areDecimalsObtained;
    }

    function getCoupon(uint256) external view override returns (RegisteredCoupon memory registeredCoupon) {
        registeredCoupon.coupon.recordDate = 1753874807;
        registeredCoupon.coupon.executionDate = _dateType == DateType.ZERO
            ? 0
            : _dateType == DateType.TODAY
                ? block.timestamp
                : 1919590386;
        registeredCoupon.coupon.startDate = 1751282807;
        registeredCoupon.coupon.endDate = 1919590386;
        registeredCoupon.coupon.fixingDate = 1919590386;
        registeredCoupon.coupon.rate = 1;
        registeredCoupon.coupon.rateDecimals = 6;
        registeredCoupon.coupon.rateStatus = RateCalculationStatus.SET;
        registeredCoupon.snapshotId = 1;
    }

    function getCouponHolders(uint256, uint256, uint256) external view override returns (address[] memory) {
        if (_holders.length > 0 && _holders[0] == address(2)) {
            revert UnableToGetCouponHolders();
        }
        return _holders;
    }

    function getSecurityHolders(uint256, uint256) external view returns (address[] memory) {
        if (_holders.length > 0 && _holders[0] == address(2)) {
            revert UnableToGetCouponHolders();
        }
        return _holders;
    }

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 20000;
        bondDetailsData_.nominalValueDecimals = 2;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = _dateType == DateType.ZERO
            ? 0
            : _dateType == DateType.TODAY
                ? block.timestamp
                : 1919590386;
    }

    function isProceedRecipient(address) external view returns (bool) {
        return _isProceedRecipientForTheBond;
    }

    function decimals() external view returns (uint8) {
        if (!_decimalsObtained) {
            revert DecimalsNotObtained();
        }
        return 2;
    }

    function getCouponAmountFor(
        uint256,
        address
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        couponAmountFor_.numerator = _amount;
        couponAmountFor_.denominator = 1;
        couponAmountFor_.recordDateReached = true;
    }

    function getPrincipalFor(address) external view override returns (PrincipalFor memory principalFor_) {
        principalFor_.numerator = _amount;
        principalFor_.denominator = 1;
    }

    function getTotalCouponHolders(uint256) external view override returns (uint256) {
        return _holders.length;
    }

    function getCouponFor(uint256, address) external pure override returns (CouponFor memory couponFor_) {
        couponFor_.tokenBalance = 1;
        couponFor_.decimals = 2;
        couponFor_.recordDateReached = true;
        couponFor_.coupon.recordDate = 1753874807;
        couponFor_.coupon.executionDate = 1753874807;
        couponFor_.coupon.startDate = 1751282807;
        couponFor_.coupon.endDate = 1919590386;
        couponFor_.coupon.fixingDate = 1919590386;
        couponFor_.coupon.rate = 2;
        couponFor_.coupon.rateDecimals = 2;
        couponFor_.coupon.rateStatus = RateCalculationStatus.SET;
    }

    function fullRedeemAtMaturity(address) external pure {
        return;
    }

    function getCouponCount() external pure override returns (uint256) {
        return 1;
    }

    function getCouponFromOrderedListAt(uint256) external pure override returns (uint256) {
        return 1;
    }

    function getCouponsOrderedList(uint256, uint256) external pure override returns (uint256[] memory) {
        uint256[] memory list = new uint256[](1);
        list[0] = 1;
        return list;
    }

    function getCouponsOrderedListTotal() external pure override returns (uint256) {
        return 1;
    }
}
