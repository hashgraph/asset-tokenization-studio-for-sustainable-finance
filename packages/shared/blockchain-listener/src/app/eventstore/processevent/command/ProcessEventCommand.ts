// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsDefined } from "class-validator"
import BlockchainEvent from "@domain/event/BlockchainEvent"

export class ProcessEventCommand extends Command<void> {
  @IsDefined()
  readonly event: BlockchainEvent

  constructor(event: BlockchainEvent) {
    super()
    this.event = event
  }
}
