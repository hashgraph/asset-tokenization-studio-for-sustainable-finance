// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface ILifeCycleCashFlowStorageWrapper {
    /*
     * @dev Emitted when a token is associated with an account
     *
     * @param token The token the account is associated with
     */
    event TokenAssociated(address token);

    /**
     * @notice Error thrown when attempting to execute a payment for an asset not managed by the contract
     *
     * @param asset The address of the asset that is being tried to operate with
     */
    error InvalidAsset(address asset);

    /**
     * @notice Error thrown when attempting to execute a payment a date does not corresponds to the payment date
     * @param paymentDateInit The initial execution date
     * @param requestedDate The date a certain operation is requested to be made
     */
    error NotPaymentDate(uint256 paymentDateInit, uint256 requestedDate);

    /**
     * @notice Error thrown when the token association failed
     */
    error AssociateTokenFailed();
}
