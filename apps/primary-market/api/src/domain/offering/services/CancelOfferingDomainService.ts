// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { OfferingRepository } from "../repositories/OfferingRepository"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { OfferingNotFoundError } from "../errors/OfferingNotFoundError"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionNotFoundError } from "@domain/subscription/errors/SubscriptionNotFoundError"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CancelOfferingDomainServiceRequest } from "./model/CancelOfferingDomainServiceRequest"

@Singleton()
export class CancelOfferingDomainService {
  constructor(
    @Inject() private readonly offeringRepository: OfferingRepository,
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(request: CancelOfferingDomainServiceRequest): Promise<void> {
    const { marketId, offeringId, operatorId, subscriptionIdsSuccess, subscriptionIdsFailed } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketId)
    market.checkActive()

    const existingOffering = await this.offeringRepository.findByOfferingId(offeringId)
    if (!existingOffering) {
      throw OfferingNotFoundError.offeringIdError(offeringId)
    }

    existingOffering.checkOperator(operatorId)

    const subscriptionsToUpdate = [
      ...(await this.updateSubscriptionsStatus(subscriptionIdsSuccess, SubscriptionStatus.CANCELLED)),
      ...(await this.updateSubscriptionsStatus(subscriptionIdsFailed, SubscriptionStatus.FAILED)),
    ]

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }

  private async updateSubscriptionsStatus(
    subscriptionIds: string[],
    status: SubscriptionStatus,
  ): Promise<Subscription[]> {
    const updated: Subscription[] = []

    for (const subscriptionId of subscriptionIds) {
      const subscription = await this.subscriptionRepository.findBySubscriptionId(subscriptionId)
      if (!subscription) {
        throw SubscriptionNotFoundError.subscriptionIdError(subscriptionId)
      }
      subscription.status = status
      updated.push(subscription)
    }

    return updated
  }
}
