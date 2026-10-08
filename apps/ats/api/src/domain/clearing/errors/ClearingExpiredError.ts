// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class ClearingExpiredError extends DomainError {
  constructor(clearingId: number, expirationDate: Date) {
    super(`Clearing ${clearingId} has expired on ${expirationDate.toISOString()}`)
  }
}
