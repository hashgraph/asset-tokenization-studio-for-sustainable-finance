// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class SetRedemptionHolderToSuccessCommand extends Command<void> {
  @IsNotEmpty()
  holderAccountId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNotEmpty()
  treasuryId: string

  @IsNotEmpty()
  paymentTokenId: string

  constructor(holderAccountId: string, amount: string, treasuryId: string, paymentTokenId: string) {
    super()
    this.holderAccountId = holderAccountId
    this.amount = amount
    this.treasuryId = treasuryId
    this.paymentTokenId = paymentTokenId
  }
}
