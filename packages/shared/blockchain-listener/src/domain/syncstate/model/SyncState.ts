// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsString, IsNumber, IsNotEmpty } from "class-validator"

export class SyncState extends BaseEntity {

  @IsNumber()
  @IsNotEmpty()
  lastBlockNumber: number

  @IsString()
  @IsNotEmpty()
  lastTimestamp: string
}