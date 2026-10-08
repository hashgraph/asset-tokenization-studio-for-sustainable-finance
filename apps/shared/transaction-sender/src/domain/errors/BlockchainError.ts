// SPDX-License-Identifier: Apache-2.0

/**
 * Custom error class for blockchain transaction failures.
 * Carries metadata about the error including transaction ID and whether it's transient.
 */
export class BlockchainError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly transactionId: string,
    public readonly isTransient: boolean = false,
  ) {
    super(message)
    this.name = "BlockchainError"
  }
}
