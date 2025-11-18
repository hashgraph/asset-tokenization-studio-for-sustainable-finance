// SPDX-License-Identifier: Apache-2.0
import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class ClearingRedeemFoundError extends DomainError {
  constructor(clearingId: number) {
    super(`Clearing redeem with id ${clearingId} already exists`)
  }
}
