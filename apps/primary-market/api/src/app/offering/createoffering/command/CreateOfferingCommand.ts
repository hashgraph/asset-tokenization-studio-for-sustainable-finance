// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CreateOfferingCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsNotEmpty()
  @IsString()
  treasuryContractId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenContractId: string

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
    offeringId: number,
    marketContractId: string,
    bondContractId: string,
    operatorAccountId: string,
    treasuryContractId: string,
    paymentTokenContractId: string,
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
    this.marketContractId = marketContractId
    this.bondContractId = bondContractId
    this.operatorAccountId = operatorAccountId
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
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
