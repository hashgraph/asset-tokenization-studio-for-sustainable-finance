// SPDX-License-Identifier: Apache-2.0

import { Command, Event } from "@hashgraph/green-bonds-shared-core"
import { IsDefined } from "class-validator"
import { EventStoreCommandResponse } from "@app/eventstore/processevent/command/EventStoreCommandResponse"

export class ProcessEventCommand extends Command<EventStoreCommandResponse> {
  @IsDefined()
  readonly event: Event

  constructor(event: Event, transactionId) {
    super(transactionId)
    this.event = event
  }
}
