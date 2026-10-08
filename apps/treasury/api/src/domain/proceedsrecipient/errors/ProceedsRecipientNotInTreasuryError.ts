import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class ProceedsRecipientNotInTreasuryError extends EntityNotFoundError {
  static contractIdError(contractId: string, treasuryContractId: string): ProceedsRecipientNotInTreasuryError {
    return new ProceedsRecipientNotInTreasuryError(
      `ProceedsRecipient with contractId ${contractId} does not belong to treasury ${treasuryContractId}`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
