// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class ClearingNotFoundError extends DomainError {
  constructor(clearingId?: string) {
    super(`Clearing ${clearingId ? `with id ${clearingId}` : ""} not found`)
  }
}
