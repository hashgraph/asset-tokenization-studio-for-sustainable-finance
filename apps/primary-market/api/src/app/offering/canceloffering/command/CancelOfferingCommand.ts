// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsArray } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CancelOfferingCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsSuccess: string[]

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsFailed: string[]

  constructor(
    offeringDltId: string,
    marketContractId: string,
    operatorAccountId: string,
    subscriptionDltIdsSuccess: string[],
    subscriptionDltIdsFailed: string[],
  ) {
    super()
    this.offeringDltId = offeringDltId
    this.marketContractId = marketContractId
    this.operatorAccountId = operatorAccountId
    this.subscriptionDltIdsSuccess = subscriptionDltIdsSuccess
    this.subscriptionDltIdsFailed = subscriptionDltIdsFailed
  }
}
