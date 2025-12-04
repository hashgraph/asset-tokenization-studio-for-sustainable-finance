// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientFoundError extends DomainError {
  static contractIdAndProceedRecipientAddressError(
    contractId: string,
    proceedRecipientAddress: string,
  ): BondProceedRecipientFoundError {
    return new BondProceedRecipientFoundError(
      `Bond proceed recipient with contractId ${contractId} and proceedRecipientAddress ${proceedRecipientAddress} already exists`,
    )
  }
}
