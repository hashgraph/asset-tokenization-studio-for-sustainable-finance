// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketFactoryUnpausedEvent extends Event {
  constructor(public readonly factoryContractId: string) {
    super()
  }
}
