// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SubmitSubscriptionCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionId: string

  @IsNotEmpty()
  @IsString()
  investorId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  constructor(offeringId: string, marketId: string, subscriptionId: string, investorId: string, lotUnits: string) {
    super()
    this.offeringId = offeringId
    this.marketId = marketId
    this.subscriptionId = subscriptionId
    this.investorId = investorId
    this.lotUnits = lotUnits
  }
}
