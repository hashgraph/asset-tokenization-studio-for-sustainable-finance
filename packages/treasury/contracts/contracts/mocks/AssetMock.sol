// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { IAssetMock } from "./interfaces/IAssetMock.sol";

contract AssetMock is IAssetMock {
    string internal name = "Mock Bond";
    string internal symbol = "MBOND";
    DateType internal dateType;
    int256 internal tokenBalance;
    address[] internal holders;
    bool internal isProceedRecipientForTheBond;
    bool decimalsObtained;

    enum DateType {
        ZERO,
        TODAY,
        FUTURE
    }

    // solhint-disable-next-line no-empty-blocks
    constructor(
        DateType date,
        int256 holderTokenBalance,
        address[] memory couponHolders,
        bool addressIsProceedRecipient,
        bool areDecimalsObtained
    ) {
        dateType = date;
        tokenBalance = holderTokenBalance;
        holders = couponHolders;
        isProceedRecipientForTheBond = addressIsProceedRecipient;
        decimalsObtained = areDecimalsObtained;
    }

    function getCoupon(uint256) external view returns (RegisteredCoupon memory registeredCoupon) {
        registeredCoupon.coupon.recordDate = 1753874807;
        registeredCoupon.coupon.executionDate = dateType == DateType.ZERO ? 0 : dateType == DateType.TODAY ? block.timestamp : 1919590386;
        registeredCoupon.coupon.rate = 1;
        registeredCoupon.coupon.rateDecimals = 6;
        registeredCoupon.coupon.period = 2592000;
        registeredCoupon.snapshotId = 1;
    }

    function getCouponHolders(uint256, uint256, uint256) external view returns (address[] memory) {
        if (holders.length > 0 && holders[0] == address(2)) {
            revert ("Wasn't able to get coupon holders");
        }
        return holders;
    }

    function getSecurityHolders(uint256, uint256) external view returns (address[] memory) {
        if (holders.length > 0 && holders[0] == address(2)) {
            revert ("Wasn't able to get coupon holders");
        }
        return holders;
    }

    function getBondDetails() external view returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 20000;
        bondDetailsData_.nominalValueDecimals = 2;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = dateType == DateType.ZERO ? 0 : dateType == DateType.TODAY ? block.timestamp : 1919590386;
    }

    function getCouponFor(uint256, address) external view returns (CouponFor memory couponFor_) {
        if (tokenBalance < 0){
            revert ("Insufficient balance");
        }
        couponFor_.tokenBalance = uint256(tokenBalance);
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
        if (tokenBalance < 0){
            revert ("Insufficient balance");
        }
        return uint256(tokenBalance);
    }

    function decimals() external view returns (uint8) {
        if (!decimalsObtained){
            revert ("Decimals not obtained");
        }
        return 2;
    }

    function redeemAtMaturityByPartition(address, bytes32, uint256) external pure {
        return;
    }

    function balanceOfByPartition(bytes32, address) external pure returns (uint256) {
        return 1;
    }

    function partitionsOf(address) external pure returns (bytes32[] memory) {
        return new bytes32[](1);
    }
}
