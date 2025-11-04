// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateOfferingCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  bondId: string

  @IsNotEmpty()
  @IsString()
  operatorId: string

  @IsNotEmpty()
  @IsString()
  treasuryId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenId: string

  @IsNotEmpty()
  @IsNumberString()
  lotSize: string

  @IsNotEmpty()
  @IsNumberString()
  minQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  maxQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  targetQuantity: string

  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @IsNotEmpty()
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number

  constructor(
    offeringId: string,
    marketId: string,
    bondId: string,
    operatorId: string,
    treasuryId: string,
    paymentTokenId: string,
    lotSize: string,
    minQuantity: string,
    maxQuantity: string,
    targetQuantity: string,
    targetQuantityRule: number,
    startDate: Date,
    endDate: Date,
    deadlineRule: number,
  ) {
    super()
    this.offeringId = offeringId
    this.marketId = marketId
    this.bondId = bondId
    this.operatorId = operatorId
    this.treasuryId = treasuryId
    this.paymentTokenId = paymentTokenId
    this.lotSize = lotSize
    this.minQuantity = minQuantity
    this.maxQuantity = maxQuantity
    this.targetQuantity = targetQuantity
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
  }
}
