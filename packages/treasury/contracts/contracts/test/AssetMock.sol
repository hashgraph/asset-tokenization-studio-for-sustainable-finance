// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import {IAssetMock} from './interfaces/IAssetMock.sol';

contract AssetMock is IAssetMock {
    string internal name = 'Mock Bond';
    string internal symbol = 'MBOND';
    bool internal isToday;
    bool internal withHolders;

    // solhint-disable-next-line no-empty-blocks
    constructor(bool todayIsExecutionDate, bool wHolders) {
        isToday = todayIsExecutionDate;
        withHolders = wHolders;
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
    ) external view returns (address[] memory holders_) {
        if (!withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x05FbA803Be258049A27B820088bab1cAD2058871;
    }

    function getBondDetails() external pure returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 2345678901;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = 1761823607;
    }
}
