// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SubmitSubscriptionCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number

  @IsNotEmpty()
  @IsString()
  investorAccountId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  constructor(
    offeringId: number,
    marketContractId: string,
    subscriptionId: number,
    investorAccountId: string,
    lotUnits: string,
  ) {
    super()
    this.offeringId = offeringId
    this.marketContractId = marketContractId
    this.subscriptionId = subscriptionId
    this.investorAccountId = investorAccountId
    this.lotUnits = lotUnits
  }
}
