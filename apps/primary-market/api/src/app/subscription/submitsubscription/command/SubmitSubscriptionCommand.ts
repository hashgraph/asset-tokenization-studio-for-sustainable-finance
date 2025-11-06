// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SubmitSubscriptionCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionId: string

  @IsNotEmpty()
  @IsString()
  investorId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  constructor(
    offeringId: string,
    marketContractId: string,
    subscriptionId: string,
    investorId: string,
    lotUnits: string,
  ) {
    super()
    this.offeringId = offeringId
    this.marketContractId = marketContractId
    this.subscriptionId = subscriptionId
    this.investorId = investorId
    this.lotUnits = lotUnits
  }
}
