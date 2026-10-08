// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class ProceedsRecipientNotFoundError extends EntityNotFoundError {
  static contractIdError(contractId: string): ProceedsRecipientNotFoundError {
    return new ProceedsRecipientNotFoundError(`ProceedsRecipient with contractId ${contractId} not found`)
  }

  private constructor(message: string) {
    super(message)
  }
}
