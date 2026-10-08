// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class ClearingNotFoundError extends EntityNotFoundError {
  constructor(clearingId?: string) {
    super(`Clearing ${clearingId ? `with id ${clearingId}` : ""} not found`)
  }
}
