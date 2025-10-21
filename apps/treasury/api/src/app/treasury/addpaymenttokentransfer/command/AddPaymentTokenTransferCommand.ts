// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddPaymentTokenTransferCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  accountId: string

  @IsString()
  @IsNotEmpty()
  paymentTokenId: string

  @IsString()
  @IsNotEmpty()
  amount: string

  @IsString()
  @IsNotEmpty()
  type: string

  constructor(accountId: string, paymentTokenId: string, amount: string, type: string) {
    super()
    this.accountId = accountId
    this.paymentTokenId = paymentTokenId
    this.amount = amount
    this.type = type
  }
}
