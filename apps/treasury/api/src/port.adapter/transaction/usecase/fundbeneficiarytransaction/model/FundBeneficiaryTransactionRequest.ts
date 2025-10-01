// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class FundBeneficiaryTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsNotEmpty()
  readonly address: string

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number

  constructor(address: string, amount: number, format: string) {
    super(format)
    this.address = address
    this.amount = amount
  }
}
