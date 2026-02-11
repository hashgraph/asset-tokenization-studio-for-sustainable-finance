// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsDate, IsNumberString } from "class-validator"

export class BondCoupon {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  corporateActionId: string

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
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @IsDate()
  fixingDate: Date

  @IsNotEmpty()
  @IsNumberString()
  rate: string

  @IsNotEmpty()
  @IsNumberString()
  rateDecimals: string

  @IsNotEmpty()
  @IsNumberString()
  rateStatus: string

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
