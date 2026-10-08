import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondFoundError extends EntityFoundError {
  static contractIdError(contractId: string): BondFoundError {
    return new BondFoundError(`Bond with contract id ${contractId} already exists.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
