// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"

export class GetSubscriptionQuery extends Query<SubscriptionQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  readonly offeringId: number

  @IsNumber()
  @IsNotEmpty()
  readonly subscriptionId: number

  constructor(marketContractId: string, offeringId: number, subscriptionId: number) {
    super()
    this.marketContractId = marketContractId
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
