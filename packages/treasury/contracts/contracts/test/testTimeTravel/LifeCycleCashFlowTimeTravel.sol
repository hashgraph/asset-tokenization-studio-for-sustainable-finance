// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

import {LifeCycleCashFlow} from '../../LifeCycleCashFlow.sol';
import {
    LocalContext
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_0/context/LocalContext.sol';
import {TimeTravel} from './timeTravel/TimeTravel.sol';

contract LifeCycleCashFlowTimeTravel is LifeCycleCashFlow, TimeTravel {
    // solhint-disable-next-line no-empty-blocks
    function _associateToken(address _newPaymenToken) internal override {}

    function _blockTimestamp()
        internal
        view
        override(LocalContext, TimeTravel)
        returns (uint256)
    {
        return TimeTravel._blockTimestamp();
    }
}
