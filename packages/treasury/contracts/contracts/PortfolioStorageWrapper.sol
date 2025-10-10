// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {IPortfolio} from './interfaces/IPortfolio.sol';
import {PORTFOLIO_STORAGE_POSITION} from './constants/storagePositions.sol';
import {
    Common as AtsCommon
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    HederaTokenService,
    HederaResponseCodes
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';

abstract contract PortfolioStorageWrapper is
    IPortfolio,
    AtsCommon,
    HederaTokenService
{
    using EnumerableSet for EnumerableSet.AddressSet;

    struct PortfolioStorage {
        EnumerableSet.AddressSet erc721s;
        address paymentToken;
        bool initialized;
    }

    /**
     * @dev Add a new ERC721 token contract to the treasury
     *
     * @param erc721 The address of the ERC721 token contract to add to the treasury
     */
    function _addERC721Token(address erc721) internal returns (bool) {
        if (!_portfolioStorage().erc721s.contains(erc721)) {
            if (_portfolioStorage().erc721s.add(erc721)) {
                _associateToken(erc721);
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Remove an existing ERC721 token contract from the treasury
     *
     * @param erc721 The address of the ERC721 token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function _removeERC721Token(
        address erc721
    ) internal returns (int256 dissociationError) {
        _portfolioStorage().erc721s.remove(erc721);
        dissociationError = _dissociateTokenAllowNotAssociated(erc721);
    }

    /*
     * @dev Set the ERC721 tokens list
     *
     * @param erc721s The ERC721 tokens list to be set
     */
    function _setErc721s(address[] memory erc721s) internal {
        for (uint256 index; index < erc721s.length; ) {
            _addERC721Token(erc721s[index]);
            unchecked {
                ++index;
            }
        }
    }

    /*
     * @dev Set the payment token
     *
     * @param paymentToken The payment token to be set
     */
    function _setPaymentToken(address paymentToken) internal {
        _portfolioStorage().paymentToken = paymentToken;
    }

    /*
     * @dev Associate a token with the contract
     *
     * @param token The address of the token we want to associate with the contract
     */
    function _associateToken(address token) internal virtual {
        int256 responseCode = HederaTokenService.associateToken(
            address(this),
            token
        );
        if (
            responseCode != HederaResponseCodes.SUCCESS &&
            responseCode !=
            HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
        ) {
            revert AssociateTokenFailed(token);
        }

        emit TokenAssociated(token);
    }

    /*
     * @dev Dissociate a token from the contract
     *
     * @param token The address of the token we want to dissociate from the contract
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function _dissociateTokenAllowNotAssociated(
        address token
    ) internal virtual returns (int256 dissociationError) {
        int256 responseCode = HederaTokenService.dissociateToken(
            address(this),
            token
        );
        bool isSuccess = (responseCode == HederaResponseCodes.SUCCESS ||
            responseCode ==
            HederaResponseCodes.TOKEN_NOT_ASSOCIATED_TO_ACCOUNT);
        dissociationError = isSuccess ? HederaResponseCodes.OK : responseCode;
    }

    /*
     * @dev Dissociate a token from the contract
     *
     * @param token The address of the token we want to dissociate from the contract
     */
    function _dissociateToken(address token) internal virtual {
        int256 responseCode = HederaTokenService.dissociateToken(
            address(this),
            token
        );
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert DissociateTokenFailed(token, responseCode);
        }
    }

    /*
     * @dev Get the list of ERC721 tokens
     *
     * @return erc721s The ERC721 tokens list
     */
    function _getErc721s()
        internal
        view
        returns (EnumerableSet.AddressSet storage erc721s)
    {
        erc721s = _portfolioStorage().erc721s;
    }

    /*
     * @dev Get the payment token
     *
     * @return paymentToken The payment token
     */
    function _getPaymentToken() internal view returns (address paymentToken) {
        paymentToken = _portfolioStorage().paymentToken;
    }

    /*
     * @dev Get the LifeCycleCashFlow storage
     *
     * @returns The LifeCycleCashFlow storage
     */
    function _portfolioStorage()
        internal
        pure
        returns (PortfolioStorage storage portofolioStorage)
    {
        bytes32 position = PORTFOLIO_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            portofolioStorage.slot := position
        }
    }
}
