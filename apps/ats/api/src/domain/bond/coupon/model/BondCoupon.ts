// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsDate, IsNumberString } from "class-validator"

export class BondCoupon extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  corporateActionId: string

  @IsNotEmpty()
  @IsString()
  couponId: string

  @IsNotEmpty()
  @IsString()
  operator: string

  @IsNotEmpty()
  @IsDate()
  recordDate: Date

  @IsNotEmpty()
  @IsDate()
  executionDate: Date

  @IsNotEmpty()
  @IsNumberString()
  rate: string

  @IsNotEmpty()
  @IsNumberString()
  rateDecimals: string

  @IsNotEmpty()
  @IsNumberString()
  period: string
}
