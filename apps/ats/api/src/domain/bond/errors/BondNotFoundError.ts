import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondNotFoundError extends EntityNotFoundError {
  static contractIdError(contractId: string): BondNotFoundError {
    return new BondNotFoundError(`Bond not found for contract id: ${contractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
