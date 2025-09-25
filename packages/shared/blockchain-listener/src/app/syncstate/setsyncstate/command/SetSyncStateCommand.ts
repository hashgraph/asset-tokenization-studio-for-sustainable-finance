// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetSyncStateCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  lastBlockNumber: number

  constructor(lastBlockNumber: number) {
    super()
    this.lastBlockNumber = lastBlockNumber
  }
}
