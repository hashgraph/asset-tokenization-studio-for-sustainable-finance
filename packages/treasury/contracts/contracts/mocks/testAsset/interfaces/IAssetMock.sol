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
    function initialize_ERC1410_Basic(bool _multiPartition) external;

    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes calldata _data
    ) external returns (bytes32);

    function getERC20Metadata()
        external
        view
        returns (ERC20Metadata memory erc20Metadata_);

    function balanceOf(address _tokenHolder) external view returns (uint256);

    function balanceOfByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256);

    function partitionsOf(
        address _tokenHolder
    ) external view returns (bytes32[] memory);

    function totalSupply() external view returns (uint256);

    function isMultiPartition() external view returns (bool);

    function totalSupplyByPartition(
        bytes32 _partition
    ) external view returns (uint256);

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    ) external pure;

    function setCoupon(
        Coupon calldata _newCoupon
    ) external pure returns (bool success_, uint256 couponID_);

    function updateMaturityDate(
        uint256 _maturityDate
    ) external pure returns (bool success_);

    function getBondDetails()
        external
        pure
        returns (BondDetailsData memory bondDetailsData_);

    function getCouponDetails()
        external
        pure
        returns (CouponDetailsData memory couponDetails_);

    function getCoupon(
        uint256 _couponID
    ) external pure returns (RegisteredCoupon memory registeredCoupon_);

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external pure returns (CouponFor memory couponFor_);

    function getCouponCount() external pure returns (uint256 couponCount_);

    function getTotalCouponHolders(
        uint256 _couponID
    ) external pure returns (uint256);

    function getSecurityRegulationData()
        external
        pure
        returns (SecurityRegulationData memory securityRegulationData_);

    function getTotalSecurityHolders() external pure returns (uint256);

    function setDividends(
        Dividend calldata _newDividend
    ) external pure returns (bool success_, uint256 dividendID_);

    function setVoting(
        Voting calldata _newVoting
    ) external pure returns (bool success_, uint256 voteID_);

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external pure returns (bool success_, uint256 balanceAdjustmentID_);

    function getEquityDetails()
        external
        pure
        returns (EquityDetailsData memory equityDetailsData_);

    function getDividends(
        uint256 _dividendID
    ) external pure returns (RegisteredDividend memory registeredDividend_);

    function getDividendsFor(
        uint256 _dividendID,
        address _account
    ) external pure returns (DividendFor memory dividendFor_);

    function getDividendsCount() external pure returns (uint256 dividendCount_);

    function getTotalDividendHolders(
        uint256 _dividendID
    ) external pure returns (uint256);

    function getVoting(
        uint256 _voteID
    ) external pure returns (RegisteredVoting memory registeredVoting_);

    function getVotingFor(
        uint256 _voteID,
        address _account
    ) external pure returns (VotingFor memory votingFor_);

    function getVotingCount() external pure returns (uint256 votingCount_);

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external pure returns (address[] memory holders_);

    function getTotalVotingHolders(
        uint256 _voteID
    ) external pure returns (uint256);

    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        pure
        returns (ScheduledBalanceAdjustment memory balanceAdjustment_);

    function getScheduledBalanceAdjustmentCount()
        external
        pure
        returns (uint256 balanceAdjustmentCount_);

    function takeSnapshot() external pure returns (uint256 snapshotID_);

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external pure returns (uint256 balance_);

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external pure returns (bytes32[] memory);

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external pure returns (uint256 totalSupply_);

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external pure returns (uint256 balance_);

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external pure returns (uint256 balance_);

    function getTotalTokenHoldersAtSnapshot(
        uint256 _snapshotID
    ) external pure returns (uint256);

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external pure returns (uint256 balance_);

    function decimalsAtSnapshot(
        uint256 _snapshotID
    ) external pure returns (uint8 decimals_);

    function totalSupplyAtSnapshot(
        uint256 _snapshotID
    ) external pure returns (uint256 totalSupply_);

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

    function decimalsAt(uint256 _timestamp) external pure returns (uint8);
}
