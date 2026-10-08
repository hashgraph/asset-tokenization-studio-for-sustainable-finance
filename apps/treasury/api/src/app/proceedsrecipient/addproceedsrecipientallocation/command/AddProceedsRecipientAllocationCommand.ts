// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class AddProceedsRecipientAllocationCommand extends Command<void> {
  @IsNotEmpty()
  proceedsRecipientId: string

  @IsNotEmpty()
  paymentTokenId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  constructor(proceedsRecipientId: string, paymentTokenId: string, amount: string) {
    super()
    this.proceedsRecipientId = proceedsRecipientId
    this.paymentTokenId = paymentTokenId
    this.amount = amount
  }
}
