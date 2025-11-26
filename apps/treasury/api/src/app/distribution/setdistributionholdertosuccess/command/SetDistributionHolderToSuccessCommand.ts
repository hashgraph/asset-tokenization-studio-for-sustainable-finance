// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString, NotEquals } from "class-validator"

export class SetDistributionHolderToSuccessCommand extends Command<void> {
  @IsNotEmpty()
  holderAccountId: string

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  @IsNotEmpty()
  paymentTokenId: string

  constructor(holderAccountId: string, amount: string, distributionId: number, paymentTokenId: string) {
    super()
    this.holderAccountId = holderAccountId
    this.amount = amount
    this.distributionId = distributionId
    this.paymentTokenId = paymentTokenId
  }
}
