// SPDX-License-Identifier: Apache-2.0

import { IsIn, IsNotEmpty, IsNumberString, IsString, NotEquals } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddPaymentTokenTransferCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  accountId: string

  @IsString()
  @IsNotEmpty()
  paymentTokenId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsIn(["INFLOW", "OUTFLOW"])
  type: string

  constructor(accountId: string, paymentTokenId: string, amount: string, type: string) {
    super()
    this.accountId = accountId
    this.paymentTokenId = paymentTokenId
    this.amount = amount
    this.type = type
  }
}
