// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class ClearingTransferFoundError extends DomainError {
  constructor(clearingId: number) {
    super(`Clearing transfer with id ${clearingId} already exists`)
  }
}
