// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface IPortfolio {
    /**
     * @dev Emitted when a new ERC721 token is added to the treasury
     *
     * @param operator The operator who call the function to add the ERC721 token
     * @param erc721 The added ERC721 token
     */
    event ERC721Added(address indexed operator, address erc721);

    /**
     * @dev Emitted when an existing ERC721 token is removed from the treasury
     *
     * @param operator The operator who call the function to remove the ERC721 token
     * @param erc721 The removed ERC721 token
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    event ERC721Removed(
        address indexed operator,
        address erc721,
        int256 dissociationError
    );

    /**
     * @dev Emitted when an ERC721 token or a payment token is associated to the treasury the treasury
     *
     * @param token The token that was associated to the treasury
     */
    event TokenAssociated(address token);

    /**
     * @dev Emitted when the payment token is updated
     *
     * @param operator The operator who call the function to update the payment token
     * @param newPaymentToken The new payment token
     */
    event PaymentTokenUpdated(
        address indexed operator,
        address newPaymentToken
    );

    /**
     * @dev Error thrown when the association of an ERC721 token or a payment token to the treasury failed
     *
     * @param token The ERC721 token or the payment token that was tried to associate to the treasury
     */
    error AssociateTokenFailed(address token);

    /**
     * @dev Error thrown when the dissociation of an ERC721 token or a payment token from the treasury failed
     *
     * @param token The ERC721 token or the payment token that was tried to dissociate from the treasury
     * @param dissociationError The error code
     */
    error DissociateTokenFailed(address token, int256 dissociationError);

    /**
     * @dev Initialize the portfolio facet
     *
     * @param paymentToken The address of the payment token to associate to the treasury
     * @param erc721 The list of ERC721 tokens contracts to associate to the treasury
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Portfolio(
        address paymentToken,
        address[] memory erc721
    ) external;

    /**
     * @dev Add a new ERC721 token contract to the treasury
     *
     * @param erc721 The address of the ERC721 token contract to add to the treasury
     */
    function addERC721Token(address erc721) external;

    /**
     * @dev Remove an existing ERC721 token contract from the treasury
     *
     * @param erc721 The address of the ERC721 token contract to remove from the treasury
     *
     * @return dissociationError The possible error code happened when trying to dissociate the token
     */
    function removeERC721Token(
        address erc721
    ) external returns (int256 dissociationError);

    /**
     * @dev Update the payment token associated to the treasury
     *
     * @param paymentToken The new payment token to associate to the treasury
     */
    function updatePaymentToken(address paymentToken) external;

    /**
     * @dev Dissociate an ERC721 token or a payment token from the treasury
     *
     * @param token The address of the token to be dissociated
     */
    function dissociateToken(address token) external;

    /**
     * @dev Get the total amount of ERC721 tokens associated to the treasury
     *
     * @return total The total amount of ERC721 tokens associated to the treasury
     */
    function getTotalERC721Tokens() external view returns (uint256 total);

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
    ) external view returns (address[] memory erc721);

    /**
     * @dev Get the payment token associated to the treasury
     *
     * @return paymentToken The payment token associated to the treasury
     */
    function getPaymentToken() external view returns (address paymentToken);
}
