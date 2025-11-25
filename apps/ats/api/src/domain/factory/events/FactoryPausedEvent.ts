// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class FactoryPausedEvent extends Event {
  constructor(public readonly factoryId: string) {
    super()
  }
}
