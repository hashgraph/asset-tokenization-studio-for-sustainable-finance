// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity } from "typeorm"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"

@Entity("EventStore")
export class EventStorePersistence extends BaseEntityPersistence {
  @Column({ type: "enum", enum: EventStoreStatus })
  status: EventStoreStatus

  @Column()
  eventName: string

  @Column()
  data: string

  @Column({ nullable: true })
  errorReason?: string
}
