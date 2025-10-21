import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenNotFoundError extends EntityNotFoundError {
  static idError(id: string): PaymentTokenNotFoundError {
    return new PaymentTokenNotFoundError(`PaymentToken not found for id: ${id}.`)
  }

  static contractIdError(contractId: string): PaymentTokenNotFoundError {
    return new PaymentTokenNotFoundError(`PaymentToken not found for contract id: ${contractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
