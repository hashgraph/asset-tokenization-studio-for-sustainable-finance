// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumberString } from "class-validator"

export class SetBondCouponTransactionRequest extends BaseTransactionRequest {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  recordDate: Date

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  executionDate: Date

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
