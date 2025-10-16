// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {IProceedsManagement} from './interfaces/IProceedsManagement.sol';
import {
    ProceedsManagementStorageWrapper
} from './ProceedsManagementStorageWrapper.sol';
import {
    DEFAULT_ADMIN_ROLE,
    PAUSER_ROLE,
    PROCEEDS_FULL_MANAGER,
    FUNDS_MANAGER_ROLE
} from './constants/roles.sol';
import {
    Pause
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol';
import {
    AccessControl
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol';

abstract contract ProceedsManagement is
    IProceedsManagement,
    ProceedsManagementStorageWrapper,
    Pause,
    AccessControl
{
    /*
     * @dev Transfers an amount of payment tokens to an address
     *
     * @param to The address the payment tokens are transferred to
     * @param amount The amount of payment tokens to transfer
     */
    function transferPaymentToken(
        address to,
        uint256 amount
    ) external override onlyUnpaused onlyRole(PROCEEDS_FULL_MANAGER) {
        _transferPaymentToken(to, amount);
        emit PaymentTokenTransferred(to, amount);
    }

    /*
     * @dev Transfers an environmental asset token to an address
     *
     * @param environmentalAsset The address of the environmental asset contract
     * @param to The address the payment tokens are transferred to
     * @param tokenId The tokenId to be transferred
     */
    function transferEnvironmentalAssetToken(
        address environmentalAsset,
        address to,
        uint256 tokenId
    ) external override onlyUnpaused onlyRole(PROCEEDS_FULL_MANAGER) {
        _transferEnvironmentalAssetToken(environmentalAsset, to, tokenId);
        emit EnvironmentalAssetTokenTransferred(
            environmentalAsset,
            to,
            tokenId
        );
    }

    /*
     * @dev Funds a proceeds recipient with an amount of tokens
     *
     * @param recipient The address of the proceeds recipient that is funded
     * @param token The amount the proceeds recipient is funded with
     */
    function fundProceedsRecipient(
        address proceedsRecipient,
        uint256 amount
    )
        external
        override
        onlyUnpaused
        onlyRole(FUNDS_MANAGER_ROLE)
        onlyForBondProceedsRecipients(proceedsRecipient)
    {
        _fundProceedsRecipient(proceedsRecipient, amount);
        emit ProceedsRecipientFunded(proceedsRecipient, amount);
    }
}
