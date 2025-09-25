// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity } from "typeorm"

@Entity("EventFilter")
export class EventFilterPersistence extends BaseEntityPersistence {
  @Column()
  contractAddress: string

  @Column()
  eventName: string

  @Column()
  eventSignature: string
}
