// SPDX-License-Identifier: Apache-2.0

import { Entity, Column } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("PrimaryMarketFactory")
export class PrimaryMarketFactoryPersistence extends BaseEntityPersistence {
  @Column({ unique: true })
  contractId: string

  @Column({ default: false })
  isPaused: boolean
}
