// SPDX-License-Identifier: Apache-2.0
import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class SetBondInterestRateCommand extends Command<void> {
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

  constructor(
    bondContractId: string,
    operator: string,
    maxRate: string,
    baseRate: string,
    minRate: string,
    startPeriod: string,
    startRate: string,
    missedPenalty: string,
    reportPeriod: string,
    rateDecimals: string,
  ) {
    super()
    this.bondContractId = bondContractId
    this.operator = operator
    this.maxRate = maxRate
    this.baseRate = baseRate
    this.minRate = minRate
    this.startPeriod = startPeriod
    this.startRate = startRate
    this.missedPenalty = missedPenalty
    this.reportPeriod = reportPeriod
    this.rateDecimals = rateDecimals
  }
}
