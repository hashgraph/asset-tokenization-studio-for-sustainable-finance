// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { OfferingNotFoundError } from "../errors/OfferingNotFoundError"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionNotFoundError } from "@domain/subscription/errors/SubscriptionNotFoundError"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { ExecuteOfferingDomainServiceRequest } from "./model/ExecuteOfferingDomainServiceRequest"

@Singleton()
export class ExecuteOfferingDomainService {
  constructor(
    @Inject() private readonly offeringRepository: OfferingRepository,
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(request: ExecuteOfferingDomainServiceRequest): Promise<void> {
    const { marketId, offeringId, operatorId, subscriptionIdsSuccess, subscriptionIdsFailed } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketId)
    market.checkActive()

    const existingOffering = await this.offeringRepository.findByOfferingIdAndMarketId(offeringId, marketId)
    if (!existingOffering) {
      throw OfferingNotFoundError.offeringIdAndMarketIdError(offeringId, marketId)
    }

    existingOffering.checkOperator(operatorId)

    const subscriptionsToUpdate = [
      ...(await this.updateSubscriptionsStatus(subscriptionIdsSuccess, offeringId, SubscriptionStatus.EXECUTED)),
      ...(await this.updateSubscriptionsStatus(subscriptionIdsFailed, offeringId, SubscriptionStatus.FAILED)),
    ]

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }

  private async updateSubscriptionsStatus(
    subscriptionIds: string[],
    offeringId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription[]> {
    const subscriptions = await Promise.all(
      subscriptionIds.map(async (subscriptionId) => {
        const subscription = await this.subscriptionRepository.findBySubscriptionIdAndOfferingId(
          subscriptionId,
          offeringId,
        )
        if (!subscription) {
          throw SubscriptionNotFoundError.subscriptionIdAndOfferingIdError(subscriptionId, offeringId)
        }
        subscription.status = status
        return subscription
      }),
    )

    return subscriptions
  }
}
