// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty, IsPositive } from "class-validator"

export class FundBeneficiaryTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
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
