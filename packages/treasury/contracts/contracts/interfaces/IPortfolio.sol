// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IPortfolio {
    /**
     * @dev Emitted when a new environmental asset token is added to the treasury
     *
     * @param operator The operator who call the function to add the environmental asset token
     * @param environmentalAsset The added environmental asset token
     */
    event EnvironmentalAssetAdded(address indexed operator, address environmentalAsset);

    /**
     * @dev Emitted when an existing environmental asset token is removed from the treasury
     *
     * @param operator The operator who call the function to remove the environmental asset token
     * @param environmentalAsset The removed environmental asset token
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    event EnvironmentalAssetRemoved(address indexed operator, address environmentalAsset, int256 dissociationError);

    /**
     * @dev Emitted when the payment token is updated
     *
     * @param operator The operator who call the function to update the payment token
     * @param newPaymentToken The new payment token
     * @param oldPaymentToken The previous payment token existing just before the update
     * @param dissociationError The possible error code happened when trying to dissociate the token
     */
    event PaymentTokenUpdated(
        address indexed operator,
        address newPaymentToken,
        address oldPaymentToken,
        int256 dissociationError
    );

    /**
     * @dev Emitted when a token is dissociated
     *
     * @param token The dissociated token
     */
    event TokenDissociated(address token);

    /**
     * @dev Initialize the portfolio facet
     *
     * @param paymentToken The address of the payment token to associate to the treasury
     * @param environmentalAsset The list of environmental asset tokens contracts to associate to the treasury
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Portfolio(address paymentToken, address[] memory environmentalAsset) external;

    /**
     * @dev Add a new environmental asset token contract to the treasury
     *
     * @param environmentalAsset The address of the environmental asset token contract to add to the treasury
     */
    function addEnvironmentalAssetToken(address environmentalAsset) external;

    /**
     * @dev Remove an existing environmental asset token contract from the treasury
     *
     * @param environmentalAsset The address of the environmental asset token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function removeEnvironmentalAssetToken(address environmentalAsset) external returns (int256 dissociationError);

    /**
     * @dev Update the payment token associated to the treasury
     *
     * @param paymentToken The new payment token to associate to the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function updatePaymentToken(address paymentToken) external returns (int256 dissociationError);

    /**
     * @dev Dissociate an environmental asset token or a payment token from the treasury
     *
     * @param token The address of the token to be dissociated
     */
    function dissociateToken(address token) external;

    /**
     * @dev Get the total amount of environmental asset tokens added to the treasury
     *
     * @return total The total amount of environmental asset tokens added to the treasury
     */
    function getTotalEnvironmentalAssetTokens() external view returns (uint256 total);

    /**
     * @dev Get a page list of environmental asset tokens added to the treasury
     *
     * @param pageIndex The page index of environmental asset tokens added to the treasury
     * @param pageLength The page length of environmental asset tokens added to the treasury
     *
     * @return environmentalAssetTokensPage The page list of environmental asset tokens added to the treasury
     */
    function getEnvironmentalAssetTokens(
        uint256 pageIndex,
        uint256 pageLength
    ) external view returns (address[] memory environmentalAssetTokensPage);

    /**
     * @dev Get the payment token associated to the treasury
     *
     * @return paymentToken The payment token associated to the treasury
     */
    function getPaymentToken() external view returns (address paymentToken);
}
