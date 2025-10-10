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
        address[] memory erc721s
    ) external override onlyUninitialized(_portfolioStorage().initialized) {
        PortfolioStorage storage portfolioStorage = _portfolioStorage();
        _setErc721s(erc721s);
        _setPaymentToken(paymentToken);
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PORTFOLIO_MANAGER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        portfolioStorage.initialized = true;
    }

    /**
     * @dev Add a new ERC721 token contract to the treasury
     *
     * @param erc721 The address of the ERC721 token contract to add to the treasury
     */
    function addERC721Token(
        address erc721
    ) external override onlyUnpaused onlyRole(PORTFOLIO_MANAGER_ROLE) {
        bool tokenAdded = _addERC721Token(erc721);
        if (tokenAdded) {
            emit ERC721Added(msg.sender, erc721);
        }
    }

    /**
     * @dev Remove an existing ERC721 token contract from the treasury
     *
     * @param erc721 The address of the ERC721 token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function removeERC721Token(
        address erc721
    )
        external
        override
        onlyUnpaused
        onlyRole(PORTFOLIO_MANAGER_ROLE)
        returns (int256 dissociationError)
    {
        dissociationError = _removeERC721Token(erc721);
        emit ERC721Removed(msg.sender, erc721, dissociationError);
    }

    /**
     * @dev Update the payment token associated to the treasury
     *
     * @param paymentToken The new payment token to associate to the treasury
     */
    function updatePaymentToken(address paymentToken) external {}

    /**
     * @dev Dissociate an ERC721 token or a payment token from the treasury
     *
     * @param token The address of the token to be dissociated
     */
    function dissociateToken(
        address token
    ) external override onlyUnpaused onlyRole(PORTFOLIO_MANAGER_ROLE) {
        _dissociateToken(token);
    }

    /**
     * @dev Get the total amount of ERC721 tokens associated to the treasury
     *
     * @return total The total amount of ERC721 tokens associated to the treasury
     */
    function getTotalERC721Tokens() external view returns (uint256 total) {}

    /**
     * @dev Get a page list of ERC721 tokens associated to the treasury
     *
     * @param pageIndex The page index of ERC721 tokens associated to the treasury
     * @param pageLength The page length of ER721 tokens associated to the treasury
     *
     * @return erc721 The page list of ERC721 tokens associated to the treasury
     */

    function getERC721Tokens(
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory erc721) {}

    /**
     * @dev Get the payment token associated to the treasury
     *
     * @return paymentToken The payment token associated to the treasury
     */
    function getPaymentToken() external view returns (address paymentToken) {}
}
