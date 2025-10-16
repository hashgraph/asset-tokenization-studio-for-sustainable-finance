// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface IPortfolioStorageWrapper {
    /**
     * @dev Emitted when an environmental asset token or a payment token is associated to the treasury the treasury
     *
     * @param token The token that was associated to the treasury
     */
    event TokenAssociated(address token);

    /**
     * @dev Error thrown when the association of an environmental asset token or a payment token to the treasury failed
     *
     * @param token The environmental asset token or the payment token that was tried to associate to the treasury
     */
    error AssociateTokenFailed(address token);

    /**
     * @dev Error thrown when the dissociation of an environmental asset token or a payment token from the treasury failed
     *
     * @param token The environmental asset token or the payment token that was tried to dissociate from the treasury
     * @param dissociationError The error code
     */
    error DissociateTokenFailed(address token, int256 dissociationError);
}
