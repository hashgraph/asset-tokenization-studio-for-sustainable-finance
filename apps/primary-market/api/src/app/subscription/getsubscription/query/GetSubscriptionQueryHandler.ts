// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionQuery } from "./GetSubscriptionQuery"
import { SubscriptionQueryResponse } from "./SubscriptionQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import { CheckSubscriptionExistsDomainService } from "@domain/subscription/services/CheckSubscriptionExistsDomainService"

@Singleton()
@Handler(GetSubscriptionQuery)
export class GetSubscriptionQueryHandler implements QueryHandler<GetSubscriptionQuery, SubscriptionQueryResponse> {
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetSubscriptionQuery): Promise<SubscriptionQueryResponse> {
    const { marketId, offeringId, subscriptionId } = query

    await this.checkPrimaryMarketExistsDomainService.execute(marketId)
    await this.checkOfferingExistsDomainService.execute(offeringId, marketId)

    const subscription = await this.checkSubscriptionExistsDomainService.execute(subscriptionId, offeringId, marketId)

    return {
      id: subscription.id,
      createdAt: subscription.createdAt,
      subscriptionId: subscription.subscriptionId,
      offeringId: subscription.offering.offeringId,
      investorId: subscription.investor.accountId,
      lotUnits: subscription.lotUnits,
      status: subscription.status,
    }
  }
}
