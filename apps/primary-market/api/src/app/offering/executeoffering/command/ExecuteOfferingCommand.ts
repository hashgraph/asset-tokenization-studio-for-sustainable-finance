// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsArray } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class ExecuteOfferingCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorId: string

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsSuccess: string[]

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsFailed: string[]

  constructor(
    offeringDltId: string,
    marketContractId: string,
    operatorId: string,
    subscriptionDltIdsSuccess: string[],
    subscriptionDltIdsFailed: string[],
  ) {
    super()
    this.offeringDltId = offeringDltId
    this.marketContractId = marketContractId
    this.operatorId = operatorId
    this.subscriptionDltIdsSuccess = subscriptionDltIdsSuccess
    this.subscriptionDltIdsFailed = subscriptionDltIdsFailed
  }
}
