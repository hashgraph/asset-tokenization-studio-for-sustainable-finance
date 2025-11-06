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
  readonly offeringDltId: string

  @IsNotEmpty()
  @IsNumberString()
  readonly subscriptionDltId: string

  constructor(marketContractId: string, offeringDltId: string, subscriptionDltId: string) {
    super()
    this.marketContractId = marketContractId
    this.offeringDltId = offeringDltId
    this.subscriptionDltId = subscriptionDltId
  }
}
