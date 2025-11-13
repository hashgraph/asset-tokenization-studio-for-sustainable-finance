// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class CancelSubscriptionCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number

  constructor(offeringId: number, marketContractId: string, subscriptionId: number) {
    super()
    this.offeringId = offeringId
    this.marketContractId = marketContractId
    this.subscriptionId = subscriptionId
  }
}
