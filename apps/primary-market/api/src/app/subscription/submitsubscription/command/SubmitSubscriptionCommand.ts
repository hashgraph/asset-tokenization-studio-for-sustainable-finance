// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SubmitSubscriptionCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionDltId: string

  @IsNotEmpty()
  @IsString()
  investorId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  constructor(
    offeringDltId: string,
    marketContractId: string,
    subscriptionDltId: string,
    investorId: string,
    lotUnits: string,
  ) {
    super()
    this.offeringDltId = offeringDltId
    this.marketContractId = marketContractId
    this.subscriptionDltId = subscriptionDltId
    this.investorId = investorId
    this.lotUnits = lotUnits
  }
}
