// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientNotFoundError extends DomainError {
  private constructor(message: string) {
    super(message)
  }

  static contractIdAndProceedRecipientAddressError(contractId: string, proceedRecipientAddress: string) {
    return new BondProceedRecipientNotFoundError(
      `Bond Proceed Recipient not found with contractId: ${contractId} and proceedRecipientAddress: ${proceedRecipientAddress}`,
    )
  }
}
