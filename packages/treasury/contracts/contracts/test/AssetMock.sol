// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import {IAssetMock} from './interfaces/IAssetMock.sol';

contract AssetMock is IAssetMock {
    string internal name = 'Mock Bond';
    string internal symbol = 'MBOND';
    bool internal isToday;
    uint256 internal tokenBalance;
    address[] internal holders;
    bool internal isProceedRecipientForTheBond;

    // solhint-disable-next-line no-empty-blocks
    constructor(
        bool todayIsExecutionDate,
        uint256 holderTokenBalance,
        address[] memory couponHolders,
        bool addressIsProceedRecipient
    ) {
        isToday = todayIsExecutionDate;
        tokenBalance = holderTokenBalance;
        holders = couponHolders;
        isProceedRecipientForTheBond = addressIsProceedRecipient;
    }

    function getCoupon(
        uint256
    ) external view returns (RegisteredCoupon memory registeredCoupon) {
        registeredCoupon.coupon.recordDate = 1753874807;
        registeredCoupon.coupon.executionDate = isToday
            ? block.timestamp
            : 1919590386;
        registeredCoupon.coupon.rate = 1;
        registeredCoupon.coupon.rateDecimals = 6;
        registeredCoupon.coupon.period = 2592000;
        registeredCoupon.snapshotId = 1;
    }

    function getCouponHolders(
        uint256,
        uint256,
        uint256
    ) external view returns (address[] memory) {
        return holders;
    }

    function getSecurityHolders(
        uint256,
        uint256
    ) external view returns (address[] memory) {
        return holders;
    }

    function getBondDetails()
        external
        view
        returns (BondDetailsData memory bondDetailsData_)
    {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 20000;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = isToday ? block.timestamp : 1919590386;
    }

    function getCouponFor(
        uint256,
        address
    ) external view returns (CouponFor memory couponFor_) {
        couponFor_.tokenBalance = tokenBalance;
        couponFor_.rate = 2;
        couponFor_.rateDecimals = 2;
        couponFor_.recordDate = 1753874807;
        couponFor_.executionDate = 1753874807;
        couponFor_.period = 2592000;
        couponFor_.decimals = 2;
        couponFor_.recordDateReached = true;
    }

    function isProceedRecipient(address) external view returns (bool) {
        return isProceedRecipientForTheBond;
    }

    function balanceOf(address) external view returns (uint256) {
        return tokenBalance;
    }

    function decimals() external pure returns (uint8) {
        return 2;
    }

    function redeemAtMaturityByPartition(
        address,
        bytes32,
        uint256
    ) external pure {
        return;
    }
}
