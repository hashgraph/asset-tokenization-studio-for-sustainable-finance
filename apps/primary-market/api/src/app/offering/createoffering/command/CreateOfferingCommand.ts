// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateOfferingCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  bondId: string

  @IsNotEmpty()
  @IsString()
  treasuryId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenId: string

  @IsNotEmpty()
  @IsString()
  lotSize: string

  @IsNotEmpty()
  @IsString()
  minQuantity: string

  @IsNotEmpty()
  @IsString()
  maxQuantity: string

  @IsNotEmpty()
  @IsString()
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
