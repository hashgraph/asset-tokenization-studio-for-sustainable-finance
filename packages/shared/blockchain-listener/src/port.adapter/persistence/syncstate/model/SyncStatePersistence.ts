// SPDX-License-Identifier: Apache-2.0
import { Column, Entity } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { SyncStateStatus } from "@domain/syncstate/model/SyncStateStatus"

@Entity("SyncState")
export class SyncStatePersistence extends BaseEntityPersistence {
  @Column({ type: "enum", enum: SyncStateStatus })
  status: SyncStateStatus

  @Column({ nullable: true })
  lastBlockNumber?: number
}
