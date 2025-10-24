// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class AddProceedsRecipientAllocationCommand extends Command<void> {
  @IsNotEmpty()
  proceedsRecipientId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  constructor(proceedsRecipientId: string, amount: string) {
    super()
    this.proceedsRecipientId = proceedsRecipientId
    this.amount = amount
  }
}
