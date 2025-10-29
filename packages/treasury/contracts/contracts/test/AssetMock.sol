// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import {IAssetMock} from './interfaces/IAssetMock.sol';

contract AssetMock is IAssetMock {
    string public name = 'Mock Bond';
    string public symbol = 'MBOND';

    // solhint-disable-next-line no-empty-blocks
    constructor() {}

    function getCoupon(
        uint256
    ) external pure returns (RegisteredCoupon memory registeredCoupon) {
        registeredCoupon.coupon.recordDate = 1753874807;
        registeredCoupon.coupon.executionDate = 1793175926;
        registeredCoupon.coupon.rate = 1;
        registeredCoupon.coupon.rateDecimals = 6;
        registeredCoupon.coupon.period = 2592000;
        registeredCoupon.snapshotId = 1;
    }
}
