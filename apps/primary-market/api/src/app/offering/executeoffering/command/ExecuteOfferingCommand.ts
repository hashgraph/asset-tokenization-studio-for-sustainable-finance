// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsArray, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class ExecuteOfferingCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsArray()
  @IsNumber({}, { each: true })
  subscriptionIdsSuccess: number[]

  @IsArray()
  @IsNumber({}, { each: true })
  subscriptionIdsFailed: number[]

  constructor(
    offeringId: number,
    marketContractId: string,
    operatorAccountId: string,
    subscriptionIdsSuccess: number[],
    subscriptionIdsFailed: number[],
  ) {
    super()
    this.offeringId = offeringId
    this.marketContractId = marketContractId
    this.operatorAccountId = operatorAccountId
    this.subscriptionIdsSuccess = subscriptionIdsSuccess
    this.subscriptionIdsFailed = subscriptionIdsFailed
  }
}
