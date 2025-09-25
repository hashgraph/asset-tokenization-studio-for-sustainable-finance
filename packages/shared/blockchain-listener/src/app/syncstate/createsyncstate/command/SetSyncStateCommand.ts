// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { SyncState } from "@domain/syncstate/model/SyncState"

export class SetSyncStateCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  lastBlockNumber: number

  @IsString()
  @IsNotEmpty()
  lastTimestamp: string

  constructor(lastBlockNumber: number, lastTimestamp: string) {
    super()
    this.lastBlockNumber = lastBlockNumber
    this.lastTimestamp = lastTimestamp
  }
}