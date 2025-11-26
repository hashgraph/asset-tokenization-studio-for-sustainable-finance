// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class DistributionHolderToSucessSetEvent extends Event {
  constructor(
    readonly holderAccountId: string,
    readonly amount: string,
    readonly distributionId: number,
  ) {
    super()
  }
}
