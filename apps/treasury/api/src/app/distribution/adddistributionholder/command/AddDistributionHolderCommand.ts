// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsIn, IsNotEmpty, IsNumberString, IsNumber, NotEquals, IsOptional } from "class-validator"

export class AddDistributionHolderCommand extends Command<void> {
  @IsNotEmpty()
  holderAccountId: string

  @IsIn(["SUCCESS", "FAILED"])
  status: string

  @IsOptional()
  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount?: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  @IsNotEmpty()
  paymentTokenId: string

  constructor(
    holderAccountId: string,
    status: string,
    amount: string | undefined,
    distributionId: number,
    paymentTokenId: string,
  ) {
    super()
    this.holderAccountId = holderAccountId
    this.status = status
    this.amount = amount
    this.distributionId = distributionId
    this.paymentTokenId = paymentTokenId
  }
}
