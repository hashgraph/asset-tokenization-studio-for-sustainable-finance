// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

import {IAssetMock} from './interfaces/IAssetMock.sol';
import {
    IFactory
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol';

// solhint-disable no-unused-vars
contract AssetMock is IAssetMock {
    IFactory.SecurityType internal _securityType;
    bool internal _withHolders;

    constructor(IFactory.SecurityType _secType, bool _wHolders) {
        _securityType = _secType;
        _withHolders = _wHolders;
    }

    function getERC20Metadata()
        external
        view
        returns (ERC20Metadata memory erc20Metadata_)
    {
        erc20Metadata_.info.name = 'Mock Asset';
        erc20Metadata_.info.symbol = 'MOCK';
        erc20Metadata_.info.isin = 'MK0322861238';
        erc20Metadata_.info.decimals = 6;
        erc20Metadata_.securityType = _securityType;
    }

    function getCouponHolders(
        uint256,
        uint256,
        uint256
    ) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getSecurityHolders(
        uint256,
        uint256
    ) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getDividendHolders(
        uint256,
        uint256,
        uint256
    ) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getTokenHoldersAtSnapshot(
        uint256,
        uint256,
        uint256
    ) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function redeemAtMaturityByPartition(
        address,
        bytes32,
        uint256
    ) external pure {
        return;
    }

    function setCoupon(Coupon calldata) external pure returns (bool, uint256) {
        revert NotImplemented();
    }

    function updateMaturityDate(uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function getBondDetails()
        external
        pure
        returns (BondDetailsData memory bondDetailsData_)
    {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 2345678901;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = 1761823607;
    }

    function getCouponDetails()
        external
        pure
        returns (CouponDetailsData memory)
    {
        revert NotImplemented();
    }

    function getCoupon(
        uint256
    ) external pure returns (RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_.coupon.recordDate = 1753874807;
        registeredCoupon_.coupon.executionDate = 1753874807;
        registeredCoupon_.coupon.rate = 1;
        registeredCoupon_.snapshotId = 1;
    }

    function getCouponFor(
        uint256,
        address
    ) external pure returns (CouponFor memory couponFor_) {
        couponFor_.tokenBalance = 3;
        couponFor_.rate = 2;
        couponFor_.recordDate = 1753874807;
        couponFor_.executionDate = 1753874807;
        couponFor_.decimals = 2;
        couponFor_.recordDateReached = true;
    }

    function getCouponCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalCouponHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getSecurityRegulationData()
        external
        pure
        returns (SecurityRegulationData memory)
    {
        revert NotImplemented();
    }

    function getTotalSecurityHolders() external pure returns (uint256) {
        revert NotImplemented();
    }

    function setDividends(
        Dividend calldata
    ) external pure returns (bool, uint256) {
        revert NotImplemented();
    }

    function setVoting(Voting calldata) external pure returns (bool, uint256) {
        revert NotImplemented();
    }

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata
    ) external pure returns (bool, uint256) {
        revert NotImplemented();
    }

    function getEquityDetails()
        external
        pure
        returns (EquityDetailsData memory)
    {
        revert NotImplemented();
    }

    function getDividends(
        uint256
    ) external pure returns (RegisteredDividend memory registeredDividend_) {
        registeredDividend_.dividend.recordDate = 1753874807;
        registeredDividend_.dividend.executionDate = 1753874807;
        registeredDividend_.dividend.amount = 400;
        registeredDividend_.snapshotId = 1;
    }

    function getDividendsFor(
        uint256,
        address
    ) external pure returns (DividendFor memory dividendFor_) {
        dividendFor_.tokenBalance = 3;
        dividendFor_.amount = 200;
        dividendFor_.recordDate = 1753874807;
        dividendFor_.executionDate = 1753874807;
        dividendFor_.decimals = 2;
        dividendFor_.recordDateReached = true;
    }

    function getDividendsCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalDividendHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getVoting(
        uint256
    ) external pure returns (RegisteredVoting memory) {
        revert NotImplemented();
    }

    function getVotingFor(
        uint256,
        address
    ) external pure returns (VotingFor memory) {
        revert NotImplemented();
    }

    function getVotingCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getVotingHolders(
        uint256,
        uint256,
        uint256
    ) external pure returns (address[] memory) {
        revert NotImplemented();
    }

    function getTotalVotingHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getScheduledBalanceAdjustment(
        uint256
    ) external pure returns (ScheduledBalanceAdjustment memory) {
        revert NotImplemented();
    }

    function getScheduledBalanceAdjustmentCount()
        external
        pure
        returns (uint256)
    {
        revert NotImplemented();
    }

    function takeSnapshot() external pure returns (uint256) {
        revert NotImplemented();
    }

    function balanceOfAtSnapshotByPartition(
        bytes32,
        uint256,
        address
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function partitionsOfAtSnapshot(
        uint256,
        address
    ) external pure returns (bytes32[] memory) {
        revert NotImplemented();
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32,
        uint256
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function lockedBalanceOfAtSnapshot(
        uint256,
        address
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32,
        uint256,
        address
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalTokenHoldersAtSnapshot(
        uint256
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function balanceOfAtSnapshot(
        uint256,
        address
    ) external pure returns (uint256 balance_) {
        balance_ = 80;
    }

    function decimalsAtSnapshot(
        uint256
    ) external pure returns (uint8 decimals_) {
        decimals_ = 2;
    }

    function totalSupplyAtSnapshot(
        uint256
    ) external pure returns (uint256 totalSupply_) {
        totalSupply_ = 1000;
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata) external pure {
        revert NotImplemented();
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function approve(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function transferFrom(
        address,
        address,
        uint256
    ) external pure returns (bool) {
        revert NotImplemented();
    }

    function name() external pure returns (string memory) {
        revert NotImplemented();
    }

    function symbol() external pure returns (string memory) {
        revert NotImplemented();
    }

    function decimals() external pure returns (uint8) {
        revert NotImplemented();
    }

    function allowance(address, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function decimalsAt(uint256) external pure returns (uint8) {
        revert NotImplemented();
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410_Basic(bool) external pure {
        revert NotImplemented();
    }

    function transferByPartition(
        bytes32,
        BasicTransferInfo calldata,
        bytes calldata
    ) external pure returns (bytes32) {
        revert NotImplemented();
    }

    function balanceOf(address) external pure returns (uint256) {
        return 120;
    }

    function balanceOfByPartition(
        bytes32,
        address
    ) external pure returns (uint256) {
        revert NotImplemented();
    }

    function partitionsOf(address) external pure returns (bytes32[] memory) {
        revert NotImplemented();
    }

    function totalSupply() external pure returns (uint256) {
        return 1000;
    }

    function isMultiPartition() external pure returns (bool) {
        revert NotImplemented();
    }

    function totalSupplyByPartition(bytes32) external pure returns (uint256) {
        revert NotImplemented();
    }
}
