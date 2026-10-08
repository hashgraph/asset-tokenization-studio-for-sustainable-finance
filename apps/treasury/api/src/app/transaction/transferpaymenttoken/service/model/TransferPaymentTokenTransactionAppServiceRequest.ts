// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class TransferPaymentTokenTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  readonly to: string

  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(to: string, amount: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.to = to
    this.amount = amount
  }
}
