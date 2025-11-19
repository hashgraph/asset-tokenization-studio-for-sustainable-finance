// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ExternalTransferPaymentTokenTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Amount to transfer", example: 1, required: true })
  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @ApiProperty({ description: "Account id that will receive the amount of the token", example: 1, required: true })
  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, amount: string) {
    super(format, accountId)
    this.amount = amount
    this.accountId = accountId
  }
}
