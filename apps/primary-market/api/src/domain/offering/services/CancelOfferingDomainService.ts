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

  async execute(cancelOfferingDomainServiceRequest: CancelOfferingDomainServiceRequest): Promise<void> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(cancelOfferingDomainServiceRequest.marketId)
    market.checkActive()

    const existingOffering = await this.offeringRepository.findByOfferingId(
      cancelOfferingDomainServiceRequest.offeringId,
    )
    if (!existingOffering) {
      throw OfferingNotFoundError.offeringIdError(cancelOfferingDomainServiceRequest.offeringId)
    }

    existingOffering.checkOperator(cancelOfferingDomainServiceRequest.operatorId)

    const subscriptionsToUpdate: Subscription[] = []

    for (const subscriptionId of cancelOfferingDomainServiceRequest.subscriptionIdsSuccess) {
      const subscription = await this.subscriptionRepository.findBySubscriptionId(subscriptionId)
      if (!subscription) {
        throw SubscriptionNotFoundError.subscriptionIdError(subscriptionId)
      }
      subscription.status = SubscriptionStatus.CANCELLED
      subscriptionsToUpdate.push(subscription)
    }

    for (const subscriptionId of cancelOfferingDomainServiceRequest.subscriptionIdsFailed) {
      const subscription = await this.subscriptionRepository.findBySubscriptionId(subscriptionId)
      if (!subscription) {
        throw SubscriptionNotFoundError.subscriptionIdError(subscriptionId)
      }
      subscription.status = SubscriptionStatus.FAILED
      subscriptionsToUpdate.push(subscription)
    }

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }
}
