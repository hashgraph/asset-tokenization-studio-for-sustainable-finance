// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.18;

interface IPaymentTokenFactory {
    /**
     * @dev Emitted when a payment token is created
     *
     * @param tokenAddress The address of the just created payment token
     */
    event PaymentTokenCreated(address indexed tokenAddress);

    /**
     * @dev Error thrown when the creation of the payment token failed
     *
     * @param name The name of the payment token
     * @param symbol The symbol of the payment token
     * @param responseCode The response code
     */
    error PaymentTokenCreateError(
        string name,
        string symbol,
        int256 responseCode
    );

    /**
     * @dev Error thrown when the transfer of the payment token failed
     *
     * @param token The address of the payment token
     * @param to The destination of the payment tokens
     * @param amount The amount of payment tokens
     */
    error PaymentTokenTransferError(address token, address to, int64 amount);

    /**
     * @dev Create a payment token
     *
     * @param name The name of the payment token
     * @param symbol The symbol of the payment token
     * @param initialSupply The initial supply of the payment token
     * @param decimals The decimals number of the payment token
     *
     * @return tokenAddress The payment token address
     */
    function createPaymentToken(
        string memory name,
        string memory symbol,
        int64 initialSupply,
        int32 decimals
    ) external payable returns (address tokenAddress);

    /**
     * @dev Transfer an amount of payment tokens
     *
     * @param token The address of the payment token to be transferred
     * @param to The address of the payment token destination
     * @param amount The amount of payment tokens to be transferred
     */
    function transferPaymentToken(
        address token,
        address to,
        int64 amount
    ) external;
}
