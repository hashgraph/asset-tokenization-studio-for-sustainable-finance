// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator"

export class FundBeneficiaryTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsUUID()
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
