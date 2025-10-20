// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class ExternalTransferPaymentTokenTransactionRequest extends BaseTransactionRequest {
  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, amount: string) {
    super(format, accountId)
    this.amount = amount
    this.accountId = accountId
  }
}
