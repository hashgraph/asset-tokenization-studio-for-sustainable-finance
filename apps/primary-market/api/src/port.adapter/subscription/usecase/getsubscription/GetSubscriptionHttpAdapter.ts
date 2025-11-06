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

  @Get(":marketContractId/offerings/:offeringId/subscriptions/:subscriptionId")
  async getSubscription(
    @Param("marketContractId") marketContractId: string,
    @Param("offeringId") offeringId: string,
    @Param("subscriptionId") subscriptionDltId: string,
  ): Promise<SubscriptionResponse> {
    const query = new GetSubscriptionQuery(marketContractId, offeringId, subscriptionDltId)
    return await this.queryBus.execute(query)
  }
}
