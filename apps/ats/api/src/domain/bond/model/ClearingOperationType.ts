// SPDX-License-Identifier: Apache-2.0

/**
 * Clearing operation types matching the ATS SDK Solidity enum.
 * @see https://github.com/hashgraph/hedera-accelerator-defi-eip/blob/main/contracts/erc3643/IERC3643.sol
 */
export enum ClearingOperationType {
  TRANSFER = 0,
  REDEEM = 1,
  HOLD = 2,
}
