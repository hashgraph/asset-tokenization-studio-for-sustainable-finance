// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import {IAssetMock} from './interfaces/IAssetMock.sol';

contract AssetMock is IAssetMock {
    string internal name = 'Mock Bond';
    string internal symbol = 'MBOND';
    bool internal isToday;

    // solhint-disable-next-line no-empty-blocks
    constructor(bool todayIsExecutionDate) {
        isToday = todayIsExecutionDate;
    }

    function getCoupon(
        uint256
    ) external view returns (RegisteredCoupon memory registeredCoupon) {
        registeredCoupon.coupon.recordDate = 1753874807;
        registeredCoupon.coupon.executionDate = isToday ? block.timestamp : 1919590386;
        registeredCoupon.coupon.rate = 1;
        registeredCoupon.coupon.rateDecimals = 6;
        registeredCoupon.coupon.period = 2592000;
        registeredCoupon.snapshotId = 1;
    }
}
