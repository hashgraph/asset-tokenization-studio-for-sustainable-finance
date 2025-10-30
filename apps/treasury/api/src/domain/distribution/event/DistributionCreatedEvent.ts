// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class DistributionCreatedEvent extends Event {
  constructor(
    readonly distributionId: number,
    readonly treasuryId: string,
  ) {
    super()
  }
}
