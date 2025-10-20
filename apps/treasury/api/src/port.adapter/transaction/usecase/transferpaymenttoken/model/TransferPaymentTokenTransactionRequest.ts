// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, IsNotEmpty, NotEquals } from "class-validator"

export class TransferPaymentTokenTransactionRequest extends BaseTransactionRequest {
  @IsNotEmpty()
  readonly to: string

  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(to: string, amount: string, format: string, accountId: string) {
    super(format, accountId)
    this.to = to
    this.amount = amount
  }
}
