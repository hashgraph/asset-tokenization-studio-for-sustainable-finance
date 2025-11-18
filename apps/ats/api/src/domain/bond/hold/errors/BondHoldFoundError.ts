// SPDX-License-Identifier: Apache-2.0

export class BondHoldFoundError extends Error {
  static holdIdError(bondContractId: string, holdId: number) {
    return new BondHoldFoundError(`Bond hold with id ${holdId} already exists for bond ${bondContractId}`)
  }
}
