// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionPort } from "./GetSubscriptionPort"
import { SubscriptionResponse } from "../../shared/model/SubscriptionResponse"
import { GetSubscriptionQuery } from "@app/subscription/getsubscription/query/GetSubscriptionQuery"

@RestController("primary-markets")
export class GetSubscriptionHttpAdapter implements GetSubscriptionPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":marketContractId/offerings/:offeringDltId/subscriptions/:subscriptionDltId")
  async getSubscription(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringDltId") offeringDltId: string,
    @Param("subscriptionDltId") subscriptionDltId: string,
  ): Promise<SubscriptionResponse> {
    const query = new GetSubscriptionQuery(marketContractId, offeringDltId, subscriptionDltId)
    return await this.queryBus.execute(query)
  }
}
