// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    IProceedsManagement
} from './interfaces/IProceedsManagement.sol';
import {
Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';

abstract contract ProceedsManagementStorageWrapper is IProceedsManagement, AtsCommon {

    modifier onlyForBonsProceedsRecipients(address proceedsRecipient) {
        _checkProceedRecipient(proceedsRecipient);
        _;
    }

    function _transferPaymentToken(address to, uint256 amount) internal {
    }

    function _transferERC721Token(address erc721, address to, uint256 tokenId) internal {
    }

    function _fundProceedsRecipient(address proceedsRecipient, uint256 amount) internal {
        _transferPaymentToken(proceedsRecipient, amount);
    }

    /*
    * @dev Check that today is the execution date of the distributionId
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon identifier
     */
    function _checkProceedRecipient(
        address proceedsRecipient
    ) private view {
        if (isProceedRecipient(proceedsRecipient)) {
            revert WrongProceedsRecipient(proceedsRecipient);
        }
    }
}