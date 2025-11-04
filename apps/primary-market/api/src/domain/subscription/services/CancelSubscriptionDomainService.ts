// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { CancelSubscriptionDomainServiceRequest } from "./model/CancelSubscriptionDomainServiceRequest"
import { SubscriptionNotFoundError } from "../errors/SubscriptionNotFoundError"

@Singleton()
export class CancelSubscriptionDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(cancelSubscriptionDomainServiceRequest: CancelSubscriptionDomainServiceRequest): Promise<void> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      cancelSubscriptionDomainServiceRequest.marketId,
    )
    market.checkActive()

    const subscription = await this.subscriptionRepository.findBySubscriptionIdAndOfferingId(
      cancelSubscriptionDomainServiceRequest.subscriptionId,
      cancelSubscriptionDomainServiceRequest.offeringId,
    )

    if (!subscription) {
      throw SubscriptionNotFoundError.subscriptionIdAndOfferingIdError(
        cancelSubscriptionDomainServiceRequest.subscriptionId,
        cancelSubscriptionDomainServiceRequest.offeringId,
      )
    }

    await this.subscriptionRepository.delete(subscription)
  }
}
