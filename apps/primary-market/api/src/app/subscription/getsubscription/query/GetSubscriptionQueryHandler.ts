// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetSubscriptionQuery } from "./GetSubscriptionQuery"
import { SubscriptionQueryResponse } from "../../shared/model/SubscriptionQueryResponse"
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
    const { marketContractId, offeringDltId, subscriptionDltId } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    const offering = await this.checkOfferingExistsDomainService.execute(offeringDltId, market)

    const subscription = await this.checkSubscriptionExistsDomainService.execute(subscriptionDltId, offering)

    return Object.assign(new SubscriptionQueryResponse(), {
      subscriptionDltId: subscription.subscriptionDltId,
      offeringDltId: subscription.offering.offeringDltId,
      investorAccountId: subscription.investor.accountId,
      lotUnits: subscription.lotUnits,
      status: subscription.status,
      createdAt: subscription.createdAt,
    })
  }
}
