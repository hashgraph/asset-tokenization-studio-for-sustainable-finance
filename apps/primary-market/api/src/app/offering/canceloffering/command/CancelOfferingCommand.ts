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
  operatorId: string

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionIdsSuccess: string[]

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionIdsFailed: string[]

  constructor(
    offeringDltId: string,
    marketContractId: string,
    operatorId: string,
    subscriptionIdsSuccess: string[],
    subscriptionIdsFailed: string[],
  ) {
    super()
    this.offeringDltId = offeringDltId
    this.marketContractId = marketContractId
    this.operatorId = operatorId
    this.subscriptionIdsSuccess = subscriptionIdsSuccess
    this.subscriptionIdsFailed = subscriptionIdsFailed
  }
}
