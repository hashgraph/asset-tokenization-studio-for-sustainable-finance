// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable no-empty-blocks

import {IPortfolio} from './interfaces/IPortfolio.sol';
import {PortfolioStorageWrapper} from './PortfolioStorageWrapper.sol';
import {PORTFOLIO_MANAGER_ROLE} from './constants/roles.sol';

abstract contract Portfolio is IPortfolio, PortfolioStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Portfolio(
        address paymentToken,
        address[] memory environmentalAssets
    )
        external
        override
        notAddressZero(paymentToken)
        notAddressZeroInArray(environmentalAssets)
        onlyUninitialized(_portfolioStorage().initialized)
    {
        PortfolioStorage storage portfolioStorage = _portfolioStorage();
        _setEnvironmentalAssets(environmentalAssets);
        _setPaymentToken(paymentToken);
        portfolioStorage.initialized = true;
    }

    /**
     * @dev Add a new environmental asset token contract to the treasury
     *
     * @param environmentalAsset The address of the environmental asset token contract to add to the treasury
     */
    function addEnvironmentalAssetToken(
        address environmentalAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(PORTFOLIO_MANAGER_ROLE)
        notAddressZero(environmentalAsset)
    {
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
        notAddressZero(environmentalAsset)
        returns (int256 dissociationError)
    {
        dissociationError = _removeEnvironmentalAssetToken(environmentalAsset);
        emit EnvironmentalAssetRemoved(
            msg.sender,
            environmentalAsset,
            dissociationError
        );
    }

    /**
     * @dev Update the payment token associated to the treasury
     *
     * @param paymentToken The new payment token to associate to the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function updatePaymentToken(
        address paymentToken
    )
        external
        override
        onlyUnpaused
        onlyRole(PORTFOLIO_MANAGER_ROLE)
        notAddressZero(paymentToken)
        returns (int256 dissociationError)
    {
        address currentPaymentToken;
        (dissociationError, currentPaymentToken) = _updatePaymentToken(
            paymentToken
        );
        emit PaymentTokenUpdated(
            msg.sender,
            paymentToken,
            currentPaymentToken,
            dissociationError
        );
    }

    /**
     * @dev Dissociate an environmental asset token or a payment token from the treasury
     *
     * @param token The address of the token to be dissociated
     */
    function dissociateToken(
        address token
    )
        external
        override
        onlyUnpaused
        onlyRole(PORTFOLIO_MANAGER_ROLE)
        notAddressZero(token)
    {
        _dissociateToken(token);

        emit TokenDissociated(token);
    }

    /**
     * @dev Get the total amount of environmental asset tokens associated to the treasury
     *
     * @return total The total amount of environmental asset tokens associated to the treasury
     */
    function getTotalEnvironmentalAssetTokens()
        external
        view
        override
        returns (uint256 total)
    {
        return _getTotalEnvironmentalAssetTokens();
    }

    /**
     * @dev Get a page list of environmental asset tokens associated to the treasury
     *
     * @param pageIndex The page index of environmental asset tokens associated to the treasury
     * @param pageLength The page length of ER721 tokens associated to the treasury
     *
     * @return environmentalAssets The page list of environmental asset tokens associated to the treasury
     */

    function getEnvironmentalAssetTokens(
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory environmentalAssets) {
        environmentalAssets = _getEnvironmentalAssetTokens(
            pageIndex,
            pageLength
        );
    }

    /**
     * @dev Get the payment token associated to the treasury
     *
     * @return paymentToken The payment token associated to the treasury
     */
    function getPaymentToken()
        external
        view
        override
        returns (address paymentToken)
    {
        paymentToken = _getPaymentToken();
    }
}
