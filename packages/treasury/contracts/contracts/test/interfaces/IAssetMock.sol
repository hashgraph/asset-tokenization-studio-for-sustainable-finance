// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IAssetMock {
    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 rate;
        uint8 rateDecimals;
        uint256 period;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }
}
