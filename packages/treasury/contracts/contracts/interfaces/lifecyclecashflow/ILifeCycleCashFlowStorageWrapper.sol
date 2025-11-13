// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface ILifeCycleCashFlowStorageWrapper {
    struct DistributionPaymentResult {
        address[] failedAddresses;
        address[] succeededAddresses;
        address[] alreadyPaidAddresses;
        uint256[] paidAmounts;
    }

    struct RedemptionPaymentResult {
        address[] failedAddresses;
        address[] succeededAddresses;
        address[] alreadyPaidAddresses;
        uint256[] paidAmounts;
    }

    /**
     * @notice Error thrown when attempting to execute a payment for a asset not managed by the contract
     *
     * @param asset The address of the asset that is being tried to operate with
     */
    error InvalidAsset(address asset);

    /**
     * @notice Error thrown when attempting to execute a payment a date does not corresponds to the payment date
     *
     * @param paymentDateInit The initial execution date
     * @param requestedDate The date a certain operation is requested to be made
     */
    error NotPaymentDate(uint256 paymentDateInit, uint256 requestedDate);

    /**
     * @notice Error thrown when trying to get the decimals of the payment token
     *
     * @param token The address of the token whose decimals were tried to be fetched
     * @param responseCode The response code returned by the token service
     */
    error GetTokenDecimalsFailed(address token, int256 responseCode);

    /**
     * @notice Error thrown when trying to get the decimals of the asset
     *
     * @param asset The address of the asset whose decimals were tried to be fetched
     */
    error GetAssetDecimalsFailed(address asset);

    /**
     * @notice Error thrown when token decimals are greater than uint8
     *
     * @param token The address of the token whose decimals are invalid
     * @param decimals The decimals value returned by the token service
     */
    error InvalidTokenDecimals(address token, int32 decimals);

    /**
     * @notice Error thrown when getting the bond token balance by partition fails
     *
     * @param bond The address of the bond token whose balance was tried to be fetched
     * @param holder The address of the holder whose balance was tried to be fetched
     * @param partition The partition of the bond token whose balance was tried to be fetched
     */
    error BalanceOfByPartitionError(address bond, address holder, bytes32 partition);

    /**
     * @notice Error thrown when redeeming at maturity by partition for a holder fails
     *
     * @param bond The address of the bond token whose balance was tried to be fetched
     * @param holder The address of the holder whose balance was tried to be fetched
     * @param partition The partition of the bond token whose balance was tried to be fetched
     */
    error RedeemAtMaturityByPartitionError(address bond, address holder, bytes32 partition);

    /**
     * @notice Error thrown when the asset nominal value could not be fetched
     *
     * @param asset The address of the asset whose nominal value could not be fetched
     */
    error AssetNominalValueError(address asset);
}
