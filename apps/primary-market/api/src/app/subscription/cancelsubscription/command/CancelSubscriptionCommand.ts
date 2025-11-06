// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CancelSubscriptionCommand extends Command<void> {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionDltId: string

  constructor(offeringDltId: string, marketContractId: string, subscriptionDltId: string) {
    super()
    this.offeringDltId = offeringDltId
    this.marketContractId = marketContractId
    this.subscriptionDltId = subscriptionDltId
  }
}
