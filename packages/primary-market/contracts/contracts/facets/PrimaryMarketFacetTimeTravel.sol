// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PrimaryMarketFacet } from "./PrimaryMarketFacet.sol";
import { TimeTravelStorageWrapper } from "@hashgraph/asset-tokenization-contracts/contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "@hashgraph/asset-tokenization-contracts/contracts/layer_0/context/LocalContext.sol";

/**
 * @title PrimaryMarketFacetTimeTravel
 * @notice TimeTravel variant of PrimaryMarketFacet for testing time-dependent logic
 * @dev Extends PrimaryMarketFacet with TimeTravelStorageWrapper to override block.timestamp and block.number
 * @dev Extends Hedera Precompiled to replace transferTokens
 */
contract PrimaryMarketFacetTimeTravel is PrimaryMarketFacet, TimeTravelStorageWrapper {
    /**
     * @dev Override _blockTimestamp to use TimeTravel's mocked timestamp
     * @return Current timestamp (mocked if set, otherwise real block.timestamp)
     */
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    /**
     * @dev Override _blockNumber to use TimeTravel's mocked block number
     * @return Current block number (mocked if set, otherwise real block.number)
     */
    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
