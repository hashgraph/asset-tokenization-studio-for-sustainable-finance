// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator"

export class CreateOfferingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly bondContractId: string

  @IsNotEmpty()
  @IsString()
  readonly treasuryAddress: string

  @IsNotEmpty()
  @IsString()
  readonly paymentTokenAddress: string

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

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    bondContractId: string,
    treasuryAddress: string,
    paymentTokenAddress: string,
    lotSize: string,
    minLots: string,
    maxLots: string,
    targetLots: string,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
    price: string,
  ) {
    super(format, accountId, contractId)
    this.bondContractId = bondContractId
    this.treasuryAddress = treasuryAddress
    this.paymentTokenAddress = paymentTokenAddress
    this.lotSize = lotSize
    this.minLots = minLots
    this.maxLots = maxLots
    this.targetLots = targetLots
    this.targetQuantityRule = targetQuantityRule
    this.startDate = startDate
    this.endDate = endDate
    this.deadlineRule = deadlineRule
    this.price = price
  }
}
