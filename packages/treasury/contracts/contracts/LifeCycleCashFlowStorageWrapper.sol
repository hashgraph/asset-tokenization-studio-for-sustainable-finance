// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {ILifeCycleCashFlow} from './interfaces/ILifeCycleCashFlow.sol';
import {
    LIFECYCLE_CASH_FLOW_STORAGE_POSITION
} from './constants/storagePositions.sol';
import {
    Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';

abstract contract LifeCycleCashFlowStorageWrapper is
    ILifeCycleCashFlow,
    AtsCommon
{
    struct LifeCycleCashFlowStorage {
        address asset;
        bool initialized;
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _setAsset(address asset) internal {
        _lifeCycleCashFlowStorage().asset = asset;
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _getAsset() internal view returns (address) {
        return _lifeCycleCashFlowStorage().asset;
    }

    /*
     * @dev Get the LifeCycleCashFlow storage
     *
     * @returns The LifeCycleCashFlow storage
     */
    function _lifeCycleCashFlowStorage()
        internal
        pure
        returns (LifeCycleCashFlowStorage storage lifeCycleCashFlowStorage)
    {
        bytes32 position = LIFECYCLE_CASH_FLOW_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lifeCycleCashFlowStorage.slot := position
        }
    }
}
