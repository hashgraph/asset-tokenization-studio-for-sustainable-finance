// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import {ILifeCycleCashFlow} from './interfaces/ILifeCycleCashFlow.sol';
import {PortfolioStorageWrapper} from './PortfolioStorageWrapper.sol';
import {
    LIFECYCLE_CASH_FLOW_STORAGE_POSITION
} from './constants/storagePositions.sol';
import {
    Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';

abstract contract LifeCycleCashFlowStorageWrapper is
    ILifeCycleCashFlow,
    AtsCommon,
    PortfolioStorageWrapper
{
    struct LifeCycleCashFlowStorage {
        address bond;
        bool initialized;
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _setBond(address bond) internal {
        _lifeCycleCashFlowStorage().bond = bond;
    }

    /*
     * @dev Set the bond
     *
     * @param bond The bond to be set
     */
    function _getBond() internal view returns (address) {
        return _lifeCycleCashFlowStorage().bond;
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
