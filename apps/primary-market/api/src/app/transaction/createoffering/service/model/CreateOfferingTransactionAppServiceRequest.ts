// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator"

export class CreateOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly treasuryContractId: string

  @IsNotEmpty()
  @IsString()
  readonly paymentTokenContractId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly lotSize: string

  @IsNotEmpty()
  @IsNumberString()
  readonly minLots: string

  @IsNotEmpty()
  @IsNumberString()
  readonly maxLots: string

  @IsNotEmpty()
  @IsNumberString()
  readonly targetLots: string

  @IsNotEmpty()
  @IsNumber()
  readonly targetQuantityRule: number

  @IsNotEmpty()
  @IsNumberString()
  readonly startDate: string

  @IsNotEmpty()
  @IsNumberString()
  readonly endDate: string

  @IsNotEmpty()
  @IsNumber()
  readonly deadlineRule: number

  @IsNotEmpty()
  @IsNumberString()
  readonly price: string

  @IsNotEmpty()
  @IsNumber()
  readonly priceDecimals: number

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    bondContractId: string,
    treasuryContractId: string,
    paymentTokenContractId: string,
    lotSize: string,
    minLots: string,
    maxLots: string,
    targetLots: string,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
    price: string,
    priceDecimals: number,
  ) {
    super(format, accountId, contractId)
    this.bondContractId = bondContractId
    this.treasuryContractId = treasuryContractId
    this.paymentTokenContractId = paymentTokenContractId
    this.lotSize = lotSize
    this.minLots = minLots
    this.maxLots = maxLots
    this.targetLots = targetLots
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
    this.price = price
    this.priceDecimals = priceDecimals
  }
}
