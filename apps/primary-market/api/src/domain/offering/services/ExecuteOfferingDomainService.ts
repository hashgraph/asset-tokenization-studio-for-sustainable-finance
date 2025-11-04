// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "./CheckOfferingExistsDomainService"
import { CheckSubscriptionExistsDomainService } from "@domain/subscription/services/CheckSubscriptionExistsDomainService"
import { ExecuteOfferingDomainServiceRequest } from "./model/ExecuteOfferingDomainServiceRequest"

@Singleton()
export class ExecuteOfferingDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService,
  ) {}

  async execute(request: ExecuteOfferingDomainServiceRequest): Promise<void> {
    const { marketId, offeringId, operatorId, subscriptionIdsSuccess, subscriptionIdsFailed } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketId)
    market.checkActive()

    const existingOffering = await this.checkOfferingExistsDomainService.execute(offeringId, marketId)

    existingOffering.checkOperator(operatorId)

    const subscriptionsToUpdate = [
      ...(await this.updateSubscriptionsStatus(
        subscriptionIdsSuccess,
        offeringId,
        marketId,
        SubscriptionStatus.EXECUTED,
      )),
      ...(await this.updateSubscriptionsStatus(subscriptionIdsFailed, offeringId, marketId, SubscriptionStatus.FAILED)),
    ]

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }

  private async updateSubscriptionsStatus(
    subscriptionIds: string[],
    offeringId: string,
    marketId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription[]> {
    const subscriptions = await Promise.all(
      subscriptionIds.map(async (subscriptionId) => {
        const subscription = await this.checkSubscriptionExistsDomainService.execute(
          subscriptionId,
          offeringId,
          marketId,
        )
        subscription.status = status
        return subscription
      }),
    )

    return subscriptions
  }
}
