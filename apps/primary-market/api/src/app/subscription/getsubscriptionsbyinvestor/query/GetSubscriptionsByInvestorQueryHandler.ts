// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionsByInvestorQuery } from "./GetSubscriptionsByInvestorQuery"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"

@Singleton()
@Handler(GetSubscriptionsByInvestorQuery)
export class GetSubscriptionsByInvestorQueryHandler
  implements QueryHandler<GetSubscriptionsByInvestorQuery, QueryPageResponse<SubscriptionQueryResponse>>
{
  constructor(@Inject() private readonly subscriptionRepository: SubscriptionRepository) {}

  @Validate()
  async execute(query: GetSubscriptionsByInvestorQuery): Promise<QueryPageResponse<SubscriptionQueryResponse>> {
    const { investorAccountId, pageOptions } = query

    const subscriptionsPage = await this.subscriptionRepository.findByInvestorAccountId(
      investorAccountId,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(subscriptionsPage, (subscription: Subscription) => ({
      id: subscription.id,
      offeringId: subscription.offeringId,
      investorAccountId: subscription.investorAccountId,
      lotUnits: subscription.lotUnits,
      status: subscription.status,
      createdAt: subscription.createdAt,
    }))
  }
}
