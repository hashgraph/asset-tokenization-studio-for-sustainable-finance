import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class TreasuryNotFoundError extends EntityNotFoundError {
  static contractIdsError(contractIds: string[]): TreasuryNotFoundError {
    return new TreasuryNotFoundError(`Treasury not found for any of the contract ids: ${contractIds.join(", ")}.`)
  }

  static bondContractIdError(bondContractId: string): TreasuryNotFoundError {
    return new TreasuryNotFoundError(`Treasury not found for bond contract id: ${bondContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
