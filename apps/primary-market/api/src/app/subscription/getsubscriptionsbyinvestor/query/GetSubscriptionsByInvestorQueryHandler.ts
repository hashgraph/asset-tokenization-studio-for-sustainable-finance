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
import type { InvestorRepository } from "@domain/investor/repositories/InvestorRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { InvestorNotFoundError } from "@domain/investor/errors/InvestorNotFoundError"

@Singleton()
@Handler(GetSubscriptionsByInvestorQuery)
export class GetSubscriptionsByInvestorQueryHandler
  implements QueryHandler<GetSubscriptionsByInvestorQuery, QueryPageResponse<SubscriptionQueryResponse>>
{
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    @Inject() private readonly investorRepository: InvestorRepository,
  ) {}

  @Validate()
  async execute(query: GetSubscriptionsByInvestorQuery): Promise<QueryPageResponse<SubscriptionQueryResponse>> {
    const { investorAccountId, pageOptions } = query

    const investor = await this.investorRepository.findByAccountId(investorAccountId)
    if (!investor) {
      throw InvestorNotFoundError.accountIdError(investorAccountId)
    }

    const subscriptionsPage = await this.subscriptionRepository.findByInvestorId(
      investor.id,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(subscriptionsPage, (subscription: Subscription) => ({
      subscriptionDltId: subscription.subscriptionDltId,
      offeringDltId: subscription.offering.offeringDltId,
      investorAccountId: subscription.investor.accountId,
      lotUnits: subscription.lotUnits,
      status: subscription.status,
      createdAt: subscription.createdAt,
    }))
  }
}
