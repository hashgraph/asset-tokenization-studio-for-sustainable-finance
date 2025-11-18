// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsIn, IsNotEmpty, IsNumberString, IsOptional } from "class-validator"

export class AddRedemptionHolderCommand extends Command<void> {
  @IsNotEmpty()
  holderAccountId: string

  @IsIn(["SUCCESS", "FAILED", "ALREADY_PAID"])
  status: string

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  amount?: string

  @IsNotEmpty()
  treasuryId: string

  @IsNotEmpty()
  paymentTokenId: string

  constructor(
    holderAccountId: string,
    status: string,
    amount: string | undefined,
    treasuryId: string,
    paymentTokenId: string,
  ) {
    super()
    this.holderAccountId = holderAccountId
    this.status = status
    this.amount = amount
    this.treasuryId = treasuryId
    this.paymentTokenId = paymentTokenId
  }
}
