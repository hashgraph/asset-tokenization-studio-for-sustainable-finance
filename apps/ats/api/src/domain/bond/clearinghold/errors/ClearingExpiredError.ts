// SPDX-License-Identifier: Apache-2.0
import { BadRequestException } from "@hashgraph/green-bonds-shared-core"

export class ClearingExpiredError extends BadRequestException {
  constructor(clearingId: number, expirationDate: Date) {
    super(`Clearing ${clearingId} has expired on ${expirationDate.toISOString()}`)
  }
}
