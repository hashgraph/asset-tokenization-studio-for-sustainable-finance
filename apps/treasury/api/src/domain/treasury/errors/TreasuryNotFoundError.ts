import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class TreasuryNotFoundError extends EntityNotFoundError {
  static addressesError(addresses: string[]): TreasuryNotFoundError {
    return new TreasuryNotFoundError(`Treasury not found for any of the addresses: ${addresses.join(", ")}.`)
  }

  static bondContractAddressError(bondContractAddress: string): TreasuryNotFoundError {
    return new TreasuryNotFoundError(`Treasury not found for bond contract address: ${bondContractAddress}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
