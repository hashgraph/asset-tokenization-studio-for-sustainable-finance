// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientNotFoundError extends DomainError {
  private constructor(message: string) {
    super(message)
  }

  static contractIdAndProceedRecipientAddressError(bondContractId: string, proceedRecipientAddress: string) {
    return new BondProceedRecipientNotFoundError(
      `Bond Proceed Recipient not found with bondContractId: ${bondContractId} and proceedRecipientAddress: ${proceedRecipientAddress}`,
    )
  }
}
