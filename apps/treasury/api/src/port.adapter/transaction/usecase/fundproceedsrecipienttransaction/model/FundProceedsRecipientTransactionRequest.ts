// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsPositive } from "class-validator"

export class FundProceedsRecipientTransactionRequest extends BaseTransactionRequest {
  @IsPositive()
  readonly amount: number

  constructor(amount: number, format: string, accountId: string) {
    super(format, accountId)
    this.amount = amount
  }
}
