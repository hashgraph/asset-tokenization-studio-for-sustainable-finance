// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { CancelSubscriptionDomainServiceRequest } from "./model/CancelSubscriptionDomainServiceRequest"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckSubscriptionExistsDomainService } from "./CheckSubscriptionExistsDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"

@Singleton()
export class CancelSubscriptionDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService,
  ) {}

  async execute(cancelSubscriptionDomainServiceRequest: CancelSubscriptionDomainServiceRequest): Promise<void> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      cancelSubscriptionDomainServiceRequest.marketContractId,
    )
    market.ensureActive()

    const offering = await this.checkOfferingExistsDomainService.execute(
      cancelSubscriptionDomainServiceRequest.offeringId,
      market,
    )

    const subscription = await this.checkSubscriptionExistsDomainService.execute(
      cancelSubscriptionDomainServiceRequest.subscriptionId,
      offering.id,
      market,
    )

    subscription.status = SubscriptionStatus.CANCELLED
    await this.subscriptionRepository.save(subscription)
  }
}
