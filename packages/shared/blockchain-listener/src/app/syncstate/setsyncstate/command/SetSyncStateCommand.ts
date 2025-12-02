// SPDX-License-Identifier: Apache-2.0
import { IsIn, IsNumber, IsOptional } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetSyncStateCommand extends Command<void> {
  @IsIn(["OK", "FAILED"])
  status: string

  @IsNumber()
  @IsOptional()
  lastBlockNumber?: number

  constructor(transactionId: string, status: string, lastBlockNumber: number = undefined) {
    super(transactionId)
    this.status = status
    this.lastBlockNumber = lastBlockNumber
  }
}
