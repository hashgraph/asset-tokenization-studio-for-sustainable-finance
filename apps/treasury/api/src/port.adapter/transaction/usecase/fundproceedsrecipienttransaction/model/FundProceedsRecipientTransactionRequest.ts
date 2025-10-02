// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty, IsPositive } from "class-validator"

export class FundProceedsRecipientTransactionRequest extends BaseTransactionRequest {
  @IsHexadecimal()
  @IsNotEmpty()
  readonly address: string

  @IsPositive()
  readonly amount: number

  constructor(address: string, amount: number, format: string) {
    super(format)
    this.address = address
    this.amount = amount
  }
}
