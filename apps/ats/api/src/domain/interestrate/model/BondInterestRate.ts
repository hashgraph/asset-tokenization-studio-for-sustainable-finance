// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class BondInterestRate extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operator: string

  @IsNotEmpty()
  @IsNumberString()
  maxRate: string

  @IsNotEmpty()
  @IsNumberString()
  baseRate: string

  @IsNotEmpty()
  @IsNumberString()
  minRate: string

  @IsNotEmpty()
  @IsNumberString()
  startPeriod: string

  @IsNotEmpty()
  @IsNumberString()
  startRate: string

  @IsNotEmpty()
  @IsNumberString()
  missedPenalty: string

  @IsNotEmpty()
  @IsNumberString()
  reportPeriod: string

  @IsNotEmpty()
  @IsNumberString()
  rateDecimals: string
}
