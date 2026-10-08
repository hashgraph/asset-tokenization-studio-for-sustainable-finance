// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsDate, IsNumberString } from "class-validator"
import { Type } from "class-transformer"

export class SetBondCouponCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly corporateActionId: string

  @IsNotEmpty()
  @IsString()
  readonly couponId: string

  @IsNotEmpty()
  @IsString()
  readonly operator: string

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly recordDate: Date

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly executionDate: Date

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly startDate: Date

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly endDate: Date

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly fixingDate: Date

  @IsNotEmpty()
  @IsNumberString()
  readonly rate: string

  @IsNotEmpty()
  @IsNumberString()
  readonly rateDecimals: string

  @IsNotEmpty()
  @IsNumberString()
  readonly rateStatus: string

  constructor(
    bondContractId: string,
    corporateActionId: string,
    couponId: string,
    operator: string,
    recordDate: Date,
    executionDate: Date,
    startDate: Date,
    endDate: Date,
    fixingDate: Date,
    rate: string,
    rateDecimals: string,
    rateStatus: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.corporateActionId = corporateActionId
    this.couponId = couponId
    this.operator = operator
    this.recordDate = recordDate
    this.executionDate = executionDate
    this.startDate = startDate
    this.endDate = endDate
    this.fixingDate = fixingDate
    this.rate = rate
    this.rateDecimals = rateDecimals
    this.rateStatus = rateStatus
  }
}
