import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondLockFoundError extends DomainError {
  private constructor(message: string) {
    super(message)
  }

  static lockIdError(bondContractId: string, id: number): BondLockFoundError {
    return new BondLockFoundError(`Lock with bondContractId ${bondContractId} and id ${id} already exists`)
  }
}
