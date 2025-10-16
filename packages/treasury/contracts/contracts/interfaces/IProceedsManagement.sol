// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

interface IProceedsManagement {
    /*
     * @dev Emitted when the payment tokens were transferred to an address
     *
     * @param to The address the payment tokens were transferred to
     * @param amount The amount of payment tokens transferred
     */
    event PaymentTokenTransferred(address to, uint256 amount);

    /*
     * @dev Emitted when an environmental asset token was transferred to an address
     *
     * @param environmentalAsset The address of the environmental asset token
     * @param to The address the payment tokens were transferred to
     * @param tokenId The tokenId of the environmental asset token
     */
    event EnvironmentalAssetTokenTransferred(
        address environmentalAsset,
        address to,
        uint256 tokenId
    );

    /*
     * @dev Emitted when a proceeds recipient was funded with an amount
     *
     * @param proceedsRecipient The address of the proceeds recipient that was funded
     * @param token The amount the proceeds recipient was funded with
     */
    event ProceedsRecipientFunded(address proceedsRecipient, uint256 amount);

    /*
     * @dev Transfers an amount of payment tokens to an address
     *
     * @param to The address the payment tokens are transferred to
     * @param amount The amount of payment tokens to be transferred
     */
    function transferPaymentToken(address to, uint256 amount) external;

    /*
     * @dev Transfers an environmental asset token to an address
     *
     * @param environmentalAsset The address of the environmental asset token contract
     * @param to The address the environmental asset token is transferred to
     * @param tokenId The tokenId of the environmental asset token
     */
    function transferEnvironmentalAssetToken(
        address environmentalAsset,
        address to,
        uint256 tokenId
    ) external;

    /*
     * @dev Funds a proceeds recipient with an amount of tokens
     *
     * @param recipient The address of the proceeds recipient that is funded
     * @param token The amount the proceeds recipient is funded with
     */
    function fundProceedsRecipient(
        address proceedsRecipient,
        uint256 amount
    ) external;
}
