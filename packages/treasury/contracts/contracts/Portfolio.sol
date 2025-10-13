// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable no-empty-blocks

import {PortfolioStorageWrapper} from './PortfolioStorageWrapper.sol';
import {
    PORTFOLIO_MANAGER_ROLE,
    DEFAULT_ADMIN_ROLE,
    PAUSER_ROLE
} from './constants/roles.sol';
import {Pause} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol';
import {AccessControl} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol';

abstract contract Portfolio is PortfolioStorageWrapper, Pause, AccessControl {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Portfolio(
        address paymentToken,
        address[] memory environmentalAssets
    ) external override onlyUninitialized(_portfolioStorage().initialized) {
        PortfolioStorage storage portfolioStorage = _portfolioStorage();
        _setEnvironmentalAssets(environmentalAssets);
        _setPaymentToken(paymentToken);
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PORTFOLIO_MANAGER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        portfolioStorage.initialized = true;
    }

    /**
     * @dev Add a new environmental asset token contract to the treasury
     *
     * @param environmentalAsset The address of the environmental asset token contract to add to the treasury
     */
    function addEnvironmentalAssetToken(
        address environmentalAsset
    ) external override onlyUnpaused onlyRole(PORTFOLIO_MANAGER_ROLE) {
        bool tokenAdded = _addEnvironmentalAssetToken(environmentalAsset);
        if (tokenAdded) {
            emit EnvironmentalAssetAdded(msg.sender, environmentalAsset);
        }
    }

    /**
     * @dev Remove an existing environmental asset token contract from the treasury
     *
     * @param environmentalAsset The address of the environmental asset token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function removeEnvironmentalAssetToken(
        address environmentalAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(PORTFOLIO_MANAGER_ROLE)
        returns (int256 dissociationError)
    {
        dissociationError = _removeEnvironmentalAssetToken(environmentalAsset);
        emit EnvironmentalAssetRemoved(msg.sender, environmentalAsset, dissociationError);
    }

    /**
     * @dev Update the payment token associated to the treasury
     *
     * @param paymentToken The new payment token to associate to the treasury
     */
    function updatePaymentToken(address paymentToken) external {}

    /**
     * @dev Dissociate an environmental asset token or a payment token from the treasury
     *
     * @param token The address of the token to be dissociated
     */
    function dissociateToken(
        address token
    ) external override onlyUnpaused onlyRole(PORTFOLIO_MANAGER_ROLE) {
        _dissociateToken(token);
    }

    /**
     * @dev Get the total amount of environmental asset tokens associated to the treasury
     *
     * @return total The total amount of environmental asset tokens associated to the treasury
     */
    function getTotalEnvironmentalAssetTokens() external view returns (uint256 total) {
        return _getTotalEnvironmentalAssetTokens();
    }

    /**
     * @dev Get a page list of environmental asset tokens associated to the treasury
     *
     * @param pageIndex The page index of environmental asset tokens associated to the treasury
     * @param pageLength The page length of ER721 tokens associated to the treasury
     *
     * @return environmentalAsset The page list of environmental asset tokens associated to the treasury
     */

    function getEnvironmentalAssetTokens(
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory environmentalAsset) {}

    /**
     * @dev Get the payment token associated to the treasury
     *
     * @return paymentToken The payment token associated to the treasury
     */
    function getPaymentToken() external view returns (address paymentToken) {}
}
