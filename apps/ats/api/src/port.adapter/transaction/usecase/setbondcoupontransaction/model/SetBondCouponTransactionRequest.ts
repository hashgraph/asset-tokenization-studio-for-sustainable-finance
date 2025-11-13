// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class SetBondCouponTransactionRequest extends BaseTransactionRequest {
  @IsNumberString()
  @IsNotEmpty()
  recordDate: string

  @IsNumberString()
  @IsNotEmpty()
  executionDate: string

  @IsNumberString()
  @IsNotEmpty()
  rate: string

  @IsNumberString()
  @IsNotEmpty()
  rateDecimals: string

  @IsNumberString()
  @IsNotEmpty()
  period: string
}
