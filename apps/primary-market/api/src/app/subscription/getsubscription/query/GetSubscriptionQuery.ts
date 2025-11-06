// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"

export class GetSubscriptionQuery extends Query<SubscriptionQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly offeringId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly subscriptionId: string

  constructor(marketContractId: string, offeringId: string, subscriptionId: string) {
    super()
    this.marketContractId = marketContractId
    this.offeringId = offeringId
    this.subscriptionId = subscriptionId
  }
}
