// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, IsNotEmpty, NotEquals } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class TransferPaymentTokenTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Account id to transfer the tokens", example: "0.0.44567", required: true })
  @IsNotEmpty()
  readonly toAccountId: string

  @ApiProperty({ description: "Amount of tokens to transfer", example: "5000000", required: true })
  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(toAccountId: string, amount: string, format: string, accountId: string) {
    super(format, accountId)
    this.toAccountId = toAccountId
    this.amount = amount
  }
}
