// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {
    IProceedsManagement
} from './interfaces/IProceedsManagement.sol';
import {
Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';

abstract contract ProceedsManagementStorageWrapper is IProceedsManagement {

    function _transferPaymentToken(address to, uint256 amount) internal {
    }

    function _transferERC721Token(address erc721, address to, uint256 tokenId) internal {
    }

    function _fundProceedsBeneficiary(address proceedsBeneficiary, uint256 amount) internal {
    }
}