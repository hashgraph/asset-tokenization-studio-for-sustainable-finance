import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenNotFoundError extends EntityNotFoundError {
  constructor(treasuryContractIds: string[]) {
    super(`Payment token not found for any of the treasury contract ids: ${treasuryContractIds.join(", ")}.`)
  }
}
