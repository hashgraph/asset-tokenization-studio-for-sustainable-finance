// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

import {
    IFactory
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_3/constants/regulation.sol';

interface IAssetMock {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
    }

    struct Voting {
        uint256 recordDate;
        bytes data;
    }

    struct RegisteredVoting {
        Voting voting;
        uint256 snapshotId;
    }

    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
    }

    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

    struct DividendFor {
        uint256 tokenBalance;
        uint256 amount;
        uint256 recordDate;
        uint256 executionDate;
        uint8 decimals;
        bool recordDateReached;
    }

    struct VotingFor {
        uint256 tokenBalance;
        uint256 recordDate;
        bytes data;
        uint8 decimals;
        bool recordDateReached;
    }

    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct CouponDetailsData {
        uint256 couponFrequency;
        uint256 couponRate;
        uint256 firstCouponDate;
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 rate;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint256 rate;
        uint256 recordDate;
        uint256 executionDate;
        uint8 decimals;
        bool recordDateReached;
    }

    struct SecurityRegulationData {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    struct ERC20MetadataInfo {
        string name;
        string symbol;
        string isin;
        uint8 decimals;
    }

    struct ERC20Metadata {
        ERC20MetadataInfo info;
        IFactory.SecurityType securityType;
    }

    struct BasicTransferInfo {
        address to;
        uint256 value;
    }

    error NotImplemented();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata erc1594Metadata) external;

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410_Basic(bool multiPartition) external;

    function transferByPartition(
        bytes32 partition,
        BasicTransferInfo calldata basicTransferInfo,
        bytes calldata data
    ) external returns (bytes32);

    function getERC20Metadata()
        external
        view
        returns (ERC20Metadata memory erc20Metadata_);

    function balanceOf(address tokenHolder) external view returns (uint256);

    function balanceOfByPartition(
        bytes32 partition,
        address tokenHolder
    ) external view returns (uint256);

    function partitionsOf(
        address tokenHolder
    ) external view returns (bytes32[] memory);

    function totalSupply() external view returns (uint256);

    function isMultiPartition() external view returns (bool);

    function totalSupplyByPartition(
        bytes32 partition
    ) external view returns (uint256);

    function getCouponHolders(
        uint256 couponID,
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders);

    function getSecurityHolders(
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders);

    function getDividendHolders(
        uint256 dividendID,
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders);

    function getTokenHoldersAtSnapshot(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory holders);

    function redeemAtMaturityByPartition(
        address tokenHolder,
        bytes32 partition,
        uint256 amount
    ) external pure;

    function setCoupon(
        Coupon calldata newCoupon
    ) external pure returns (bool success, uint256 couponID);

    function updateMaturityDate(
        uint256 _maturityDate
    ) external pure returns (bool success);

    function getBondDetails()
        external
        pure
        returns (BondDetailsData memory bondDetailsData);

    function getCouponDetails()
        external
        pure
        returns (CouponDetailsData memory couponDetails);

    function getCoupon(
        uint256 couponID
    ) external pure returns (RegisteredCoupon memory registeredCoupon);

    function getCouponFor(
        uint256 couponID,
        address account
    ) external pure returns (CouponFor memory couponFor);

    function getCouponCount() external pure returns (uint256 couponCount);

    function getTotalCouponHolders(
        uint256 couponID
    ) external pure returns (uint256);

    function getSecurityRegulationData()
        external
        pure
        returns (SecurityRegulationData memory securityRegulationData);

    function getTotalSecurityHolders() external pure returns (uint256);

    function setDividends(
        Dividend calldata newDividend
    ) external pure returns (bool success, uint256 dividendID);

    function setVoting(
        Voting calldata newVoting
    ) external pure returns (bool success, uint256 voteID);

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) external pure returns (bool success, uint256 balanceAdjustmentID);

    function getEquityDetails()
        external
        pure
        returns (EquityDetailsData memory equityDetailsData);

    function getDividends(
        uint256 dividendID
    ) external pure returns (RegisteredDividend memory registeredDividend);

    function getDividendsFor(
        uint256 dividendID,
        address account
    ) external pure returns (DividendFor memory dividendFor);

    function getDividendsCount() external pure returns (uint256 dividendCount);

    function getTotalDividendHolders(
        uint256 dividendID
    ) external pure returns (uint256);

    function getVoting(
        uint256 voteID
    ) external pure returns (RegisteredVoting memory registeredVoting);

    function getVotingFor(
        uint256 voteID,
        address account
    ) external pure returns (VotingFor memory votingFor);

    function getVotingCount() external pure returns (uint256 votingCount);

    function getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) external pure returns (address[] memory holders);

    function getTotalVotingHolders(
        uint256 voteID
    ) external pure returns (uint256);

    function getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    )
        external
        pure
        returns (ScheduledBalanceAdjustment memory balanceAdjustment);

    function getScheduledBalanceAdjustmentCount()
        external
        pure
        returns (uint256 balanceAdjustmentCount);

    function takeSnapshot() external pure returns (uint256 snapshotID);

    function balanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) external pure returns (uint256 balance);

    function partitionsOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) external pure returns (bytes32[] memory);

    function totalSupplyAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID
    ) external pure returns (uint256 totalSupply);

    function lockedBalanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) external pure returns (uint256 balance);

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotID,
        address tokenHolder
    ) external pure returns (uint256 balance);

    function getTotalTokenHoldersAtSnapshot(
        uint256 snapshotID
    ) external pure returns (uint256);

    function balanceOfAtSnapshot(
        uint256 snapshotID,
        address tokenHolder
    ) external pure returns (uint256 balance);

    function decimalsAtSnapshot(
        uint256 snapshotID
    ) external pure returns (uint8 decimals);

    function totalSupplyAtSnapshot(
        uint256 snapshotID
    ) external pure returns (uint256 totalSupply);

    function transfer(address to, uint256 amount) external pure returns (bool);

    function approve(
        address spender,
        uint256 amount
    ) external pure returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external pure returns (bool);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function allowance(
        address owner,
        address spender
    ) external pure returns (uint256);

    function decimalsAt(uint256 timestamp) external pure returns (uint8);
}
