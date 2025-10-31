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

  async execute(executeOfferingDomainServiceRequest: ExecuteOfferingDomainServiceRequest): Promise<void> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      executeOfferingDomainServiceRequest.marketId,
    )
    market.checkActive()

    const existingOffering = await this.offeringRepository.findByOfferingId(
      executeOfferingDomainServiceRequest.offeringId,
    )
    if (!existingOffering) {
      throw OfferingNotFoundError.offeringIdError(executeOfferingDomainServiceRequest.offeringId)
    }

    existingOffering.checkOperator(executeOfferingDomainServiceRequest.operatorId)

    const subscriptionsToUpdate: Subscription[] = []

    for (const subscriptionId of executeOfferingDomainServiceRequest.subscriptionIdsSuccess) {
      const subscription = await this.subscriptionRepository.findBySubscriptionId(subscriptionId)
      if (!subscription) {
        throw SubscriptionNotFoundError.subscriptionIdError(subscriptionId)
      }
      subscription.status = SubscriptionStatus.EXECUTED
      subscriptionsToUpdate.push(subscription)
    }

    for (const subscriptionId of executeOfferingDomainServiceRequest.subscriptionIdsFailed) {
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
