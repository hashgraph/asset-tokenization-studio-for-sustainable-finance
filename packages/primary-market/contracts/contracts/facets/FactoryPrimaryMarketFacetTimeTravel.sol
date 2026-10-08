// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import { FactoryPrimaryMarketFacet } from "./FactoryPrimaryMarketFacet.sol";
import { TimeTravelStorageWrapper } from "@hashgraph/asset-tokenization-contracts/contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "@hashgraph/asset-tokenization-contracts/contracts/layer_0/context/LocalContext.sol";
// solhint-enable max-line-length

/**
 * @title FactoryPrimaryMarketFacetTimeTravel
 * @notice TimeTravel variant of FactoryPrimaryMarketFacet for testing time-dependent logic
 * @dev Extends FactoryPrimaryMarketFacet with TimeTravelStorageWrapper to override block.timestamp and block.number
 */
contract FactoryPrimaryMarketFacetTimeTravel is FactoryPrimaryMarketFacet, TimeTravelStorageWrapper {
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
