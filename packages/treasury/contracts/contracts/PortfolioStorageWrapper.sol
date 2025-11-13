// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import { IPortfolioStorageWrapper } from "./interfaces/IPortfolioStorageWrapper.sol";
import { PORTFOLIO_STORAGE_POSITION } from "./constants/storagePositions.sol";
import { Common as AtsCommon } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/common/Common.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    HederaTokenService,
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

abstract contract PortfolioStorageWrapper is IPortfolioStorageWrapper, AtsCommon, HederaTokenService {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct PortfolioStorage {
        EnumerableSet.AddressSet environmentalAssets;
        address paymentToken;
        bool initialized;
    }

    /**
     * @dev Check whether an address is address zero
     *
     * @param checkedAddress The address to check
     */
    modifier checkAddress(address checkedAddress) {
        _checkAddress(checkedAddress);
        _;
    }

    /**
     * @dev Check whether an array contains any address zero
     *
     * @param checkedAddress The addresses array to check
     */
    modifier checkAddresses(address[] memory checkedAddress) {
        for (uint256 index; index < checkedAddress.length; ) {
            _checkAddress(checkedAddress[index]);

            unchecked {
                ++index;
            }
        }
        _;
    }

    /**
     * @dev Add a new EnvironmentalAsset token contract to the treasury
     *
     * @param environmentalAssets The address of the EnvironmentalAsset token contract to add to the treasury
     */
    function _addEnvironmentalAssetToken(address environmentalAssets) internal returns (bool) {
        if (!_portfolioStorage().environmentalAssets.contains(environmentalAssets)) {
            if (_portfolioStorage().environmentalAssets.add(environmentalAssets)) {
                _associateToken(environmentalAssets);
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Remove an existing EnvironmentalAsset token contract from the treasury
     *
     * @param environmentalAsset The address of the EnvironmentalAsset token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function _removeEnvironmentalAssetToken(address environmentalAsset) internal returns (int256 dissociationError) {
        _portfolioStorage().environmentalAssets.remove(environmentalAsset);
        dissociationError = _dissociateTokenAllowNotAssociated(environmentalAsset);
    }

    /*
     * @dev Set the EnvironmentalAsset tokens list
     *
     * @param environmentalAssets The EnvironmentalAsset tokens list to be set
     */
    function _setEnvironmentalAssets(address[] memory environmentalAssets) internal {
        for (uint256 index; index < environmentalAssets.length; ) {
            _addEnvironmentalAssetToken(environmentalAssets[index]);
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
        _associateToken(paymentToken);
    }

    /*
     * @dev Update the payment token
     *
     * @param paymentToken The new payment token to be set
     *
     * @return dissociationError The possible error code happened when trying to dissociate the old token
     * @return oldPaymentToken The payment token existing just before the update
     */
    function _updatePaymentToken(
        address paymentToken
    ) internal returns (int256 dissociationError, address oldPaymentToken) {
        oldPaymentToken = _getPaymentToken();
        dissociationError = _dissociateTokenAllowNotAssociated(oldPaymentToken);
        _portfolioStorage().paymentToken = paymentToken;
        _associateToken(paymentToken);
    }

    /*
     * @dev Associate a token with the contract
     *
     * @param token The address of the token we want to associate with the contract
     */
    function _associateToken(address token) internal {
        int256 responseCode = HederaTokenService.associateToken(address(this), token);
        if (
            responseCode != HederaResponseCodes.SUCCESS &&
            responseCode != HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
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
    function _dissociateTokenAllowNotAssociated(address token) internal returns (int256 dissociationError) {
        int256 responseCode = HederaTokenService.dissociateToken(address(this), token);
        bool isSuccess = (responseCode == HederaResponseCodes.SUCCESS ||
            responseCode == HederaResponseCodes.TOKEN_NOT_ASSOCIATED_TO_ACCOUNT);
        dissociationError = isSuccess ? HederaResponseCodes.OK : responseCode;
    }

    /*
     * @dev Dissociate a token from the contract
     *
     * @param token The address of the token we want to dissociate from the contract
     */
    function _dissociateToken(address token) internal {
        int256 responseCode = HederaTokenService.dissociateToken(address(this), token);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert DissociateTokenFailed(token, responseCode);
        }
    }

    /**
     * @dev Get the total amount of environmental asset tokens added to the treasury
     *
     * @return total The total amount of environmental asset tokens added to the treasury
     */
    function _getTotalEnvironmentalAssetTokens() internal view returns (uint256 total) {
        return _portfolioStorage().environmentalAssets.length();
    }

    /*
     * @dev Get the list of environmental asset tokens
     *
     * @return environmentalAssetTokensPage The environmental asset tokens list
     */
    function _getEnvironmentalAssetTokens(
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory environmentalAssetTokensPage) {
        uint256 total = _portfolioStorage().environmentalAssets.length();
        uint256 start = pageIndex * pageLength;
        if (start >= total) return new address[](0);

        uint256 remaining = total - start;
        uint256 actualLength = remaining < pageLength ? remaining : pageLength;
        environmentalAssetTokensPage = new address[](actualLength);

        for (uint256 i; i < actualLength; ) {
            environmentalAssetTokensPage[i] = _portfolioStorage().environmentalAssets.at(start + i);
            unchecked {
                ++i;
            }
        }
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
     * @dev Get the Portfolio storage
     *
     * @returns The Portfolio storage
     */
    function _portfolioStorage() internal pure returns (PortfolioStorage storage portofolioStorage) {
        bytes32 position = PORTFOLIO_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            portofolioStorage.slot := position
        }
    }

    /**
     * @dev checks if a certain address is the address zero
     *
     * @param addressChecked The address to check
     */
    function _checkAddress(address addressChecked) internal pure {
        if (addressChecked == address(0)) {
            revert InvalidAddressZero();
        }
    }
}
