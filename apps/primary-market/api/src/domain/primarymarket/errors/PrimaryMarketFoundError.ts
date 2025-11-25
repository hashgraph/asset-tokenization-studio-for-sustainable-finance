// SPDX-License-Identifier: Apache-2.0

export class PrimaryMarketFoundError extends Error {
  static contractIdError(contractId: string): PrimaryMarketFoundError {
    return new PrimaryMarketFoundError(`Primary Market with contractId ${contractId} already exists`)
  }
}
