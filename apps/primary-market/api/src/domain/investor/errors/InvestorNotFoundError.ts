// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class InvestorNotFoundError extends EntityNotFoundError {
  static accountIdError(accountId: string): InvestorNotFoundError {
    return new InvestorNotFoundError(`Investor with account ID ${accountId} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
