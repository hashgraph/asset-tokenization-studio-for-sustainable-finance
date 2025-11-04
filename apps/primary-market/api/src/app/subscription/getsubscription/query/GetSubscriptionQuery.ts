// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"
import { SubscriptionQueryResponse } from "./SubscriptionQueryResponse"

export class GetSubscriptionQuery extends Query<SubscriptionQueryResponse> {
  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsNumberString()
  offeringId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionId: string

  constructor(marketId: string, offeringId: string, subscriptionId: string) {
    super()
    this.marketId = marketId
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
