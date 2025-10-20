// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, NotEquals } from "class-validator"

export class FundProceedsRecipientTransactionRequest extends BaseTransactionRequest {
  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(amount: string, format: string, accountId: string) {
    super(format, accountId)
    this.amount = amount
  }
}
