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
    ) external pure returns (RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_.coupon.recordDate = 1753874807;
        registeredCoupon_.coupon.executionDate = 1793175926;
        registeredCoupon_.coupon.rate = 1;
        registeredCoupon_.coupon.period = 2592000;
        registeredCoupon_.snapshotId = 1;
    }
}
