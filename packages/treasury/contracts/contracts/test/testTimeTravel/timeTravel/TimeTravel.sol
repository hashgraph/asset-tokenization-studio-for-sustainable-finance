// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

import {
    LocalContext
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_0/context/LocalContext.sol';
import {ITimeTravel} from '../interfaces/ITimeTravel.sol';

abstract contract TimeTravel is ITimeTravel, LocalContext {
    uint256 internal _timestamp;

    function changeSystemTimestamp(uint256 newSystemTime) external {
        if (newSystemTime == 0) {
            revert InvalidTimestamp(newSystemTime);
        }

        emit SystemTimestampChanged(_timestamp, newSystemTime);

        _timestamp = newSystemTime;
    }

    function resetSystemTimestamp() external {
        _timestamp = 0;
        emit SystemTimestampReset();
    }

    function _blockTimestamp()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }
}
