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
  readonly minQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  readonly maxQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  readonly targetQuantity: string

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

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    bondContractId: string,
    treasuryAddress: string,
    paymentTokenAddress: string,
    lotSize: string,
    minQuantity: string,
    maxQuantity: string,
    targetQuantity: string,
    targetQuantityRule: number,
    startDate: string,
    endDate: string,
    deadlineRule: number,
  ) {
    super(format, accountId, contractId)
    this.bondContractId = bondContractId
    this.treasuryAddress = treasuryAddress
    this.paymentTokenAddress = paymentTokenAddress
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
