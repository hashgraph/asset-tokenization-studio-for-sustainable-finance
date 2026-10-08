// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class BondProceedRecipientFoundError extends DomainError {
  static contractIdAndProceedRecipientAddressError(
    bondContractId: string,
    proceedRecipientAddress: string,
  ): BondProceedRecipientFoundError {
    return new BondProceedRecipientFoundError(
      `Bond proceed recipient with bondContractId ${bondContractId} and proceedRecipientAddress ${proceedRecipientAddress} already exists`,
    )
  }
}
