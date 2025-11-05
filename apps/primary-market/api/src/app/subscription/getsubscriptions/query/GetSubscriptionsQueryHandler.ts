// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionsQuery } from "./GetSubscriptionsQuery"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"

@Singleton()
@Handler(GetSubscriptionsQuery)
export class GetSubscriptionsQueryHandler
  implements QueryHandler<GetSubscriptionsQuery, QueryPageResponse<SubscriptionQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  @Validate()
  async execute(query: GetSubscriptionsQuery): Promise<QueryPageResponse<SubscriptionQueryResponse>> {
    const { marketId, offeringId, pageOptions } = query

    await this.checkPrimaryMarketExistsDomainService.execute(marketId)
    await this.checkOfferingExistsDomainService.execute(offeringId, marketId)

    const subscriptionsPage = await this.subscriptionRepository.findByOfferingIdAndMarketId(
      offeringId,
      marketId,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(subscriptionsPage, (subscription: Subscription) => ({
      id: subscription.id,
      createdAt: subscription.createdAt,
      subscriptionId: subscription.subscriptionId,
      offeringId: subscription.offering.offeringId,
      investorId: subscription.investor.accountId,
      lotUnits: subscription.lotUnits,
      status: subscription.status,
    }))
  }
}
