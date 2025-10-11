// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsDefined, IsJSON, IsNotEmpty } from "class-validator"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"

export class EventStore extends BaseEntity {
  @IsDefined()
  status: EventStoreStatus

  @IsNotEmpty()
  eventName: string

  @IsJSON()
  @IsNotEmpty()
  data: string

  errorReason?: string

  process() {
    this.status = EventStoreStatus.PROCESSED
  }

  failed(errorReason: string) {
    this.status = EventStoreStatus.FAILED
    this.errorReason = errorReason
  }
}
