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

    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint256 rate;
        uint8 rateDecimals;
        uint256 recordDate;
        uint256 executionDate;
        uint256 period;
        uint8 decimals;
        bool recordDateReached;
    }

    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }

    struct PrincipalFor {
        uint256 numerator;
        uint256 denominator;
    }
}
