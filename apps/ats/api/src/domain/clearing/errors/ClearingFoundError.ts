// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class ClearingFoundError extends DomainError {
  constructor(clearingId: number) {
    super(`Clearing with id ${clearingId} already exists`)
  }
}
