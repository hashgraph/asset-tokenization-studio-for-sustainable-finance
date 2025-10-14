// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty, IsNumberString, NotEquals } from "class-validator"

export class FundProceedsRecipientTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsHexadecimal()
  @IsNotEmpty()
  readonly address: string

  @IsNumberString({ no_symbols: true })
  @NotEquals("0")
  readonly amount: string

  constructor(address: string, amount: string, format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
    this.address = address
    this.amount = amount
  }
}
