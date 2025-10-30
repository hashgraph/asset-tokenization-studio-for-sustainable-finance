// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

export class DistributionHolderAddedEvent extends Event {
  constructor(
    readonly holderAccountId: string,
    readonly status: DistributionHolderStatus,
    readonly amount: string,
    readonly distributionId: number,
  ) {
    super()
  }
}
