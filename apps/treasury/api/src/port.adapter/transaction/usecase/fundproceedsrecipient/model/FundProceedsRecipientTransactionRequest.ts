// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, NotEquals } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class FundProceedsRecipientTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Fund amount", example: "2000000", required: true })
  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(amount: string, format: string, accountId: string) {
    super(format, accountId)
    this.amount = amount
  }
}
