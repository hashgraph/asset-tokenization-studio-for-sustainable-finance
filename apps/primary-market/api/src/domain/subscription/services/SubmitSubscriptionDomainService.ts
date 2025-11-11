// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionDomainServiceRequest } from "./model/SubmitSubscriptionDomainServiceRequest"
import { SubscriptionFoundError } from "../errors/SubscriptionFoundError"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import { Subscription } from "../model/Subscription"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

@Singleton()
export class SubmitSubscriptionDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(submitSubscriptionDomainServiceRequest: SubmitSubscriptionDomainServiceRequest): Promise<Subscription> {
    const now = new Date()
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      submitSubscriptionDomainServiceRequest.marketContractId,
    )
    market.ensureActive()

    const offering = await this.checkOfferingExistsDomainService.execute(
      submitSubscriptionDomainServiceRequest.offeringId,
      market,
    )

    const existingSubscription = await this.subscriptionRepository.findBySubscriptionIdOfferingIdAndMarketId(
      submitSubscriptionDomainServiceRequest.subscriptionId,
      offering.id,
      market.id,
    )
    if (existingSubscription) {
      throw SubscriptionFoundError.subscriptionIdOfferingIdAndMarketContractIdError(
        submitSubscriptionDomainServiceRequest.subscriptionId,
        submitSubscriptionDomainServiceRequest.offeringId,
        submitSubscriptionDomainServiceRequest.marketContractId,
      )
    }

    const subscription = Object.assign(new Subscription(), {
      id: submitSubscriptionDomainServiceRequest.subscriptionId,
      offeringId: offering.id,
      marketId: market.id,
      investorAccountId: submitSubscriptionDomainServiceRequest.investorAccountId,
      lotUnits: submitSubscriptionDomainServiceRequest.lotUnits,
      status: SubscriptionStatus.SUBMITTED,
      createdAt: now,
      updatedAt: now,
    })
    return await this.subscriptionRepository.save(subscription)
  }
}
