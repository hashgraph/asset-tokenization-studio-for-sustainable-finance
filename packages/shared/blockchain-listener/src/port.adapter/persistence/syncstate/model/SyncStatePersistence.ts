// SPDX-License-Identifier: Apache-2.0
import { SyncState } from "@domain/syncstate/model/SyncState"
import { Entity, Column } from "typeorm";
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("SyncState")
export class SyncStatePersistence extends BaseEntityPersistence {

  @Column()
  lastBlockNumber: number

  @Column()
  lastTimestamp: string
}