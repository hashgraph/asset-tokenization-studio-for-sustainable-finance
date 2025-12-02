// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNumber, IsDefined } from "class-validator"
import { SyncStateStatus } from "@domain/syncstate/model/SyncStateStatus"

export class SyncState extends BaseEntity {
  @IsDefined()
  status: SyncStateStatus

  @IsNumber()
  lastBlockNumber?: number
}
