// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionDomainServiceRequest } from "./model/SubmitSubscriptionDomainServiceRequest"
import { SubscriptionFoundError } from "../errors/SubscriptionFoundError"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository"
import type { InvestorRepository } from "@domain/investor/repositories/InvestorRepository"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import { Subscription } from "../model/Subscription"
import { Investor } from "@domain/investor/model/Investor"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

@Singleton()
export class SubmitSubscriptionDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    @Inject() private readonly investorRepository: InvestorRepository,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(submitSubscriptionDomainServiceRequest: SubmitSubscriptionDomainServiceRequest): Promise<Subscription> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      submitSubscriptionDomainServiceRequest.marketId,
    )
    market.checkActive()

    const offering = await this.checkOfferingExistsDomainService.execute(
      submitSubscriptionDomainServiceRequest.offeringId,
    )

    const existingSubscription = await this.subscriptionRepository.findBySubscriptionId(
      submitSubscriptionDomainServiceRequest.subscriptionId,
    )
    if (existingSubscription) {
      throw SubscriptionFoundError.subscriptionIdError(submitSubscriptionDomainServiceRequest.subscriptionId)
    }

    const investor = await this.getOrCreateInvestor(submitSubscriptionDomainServiceRequest.investorId)

    const subscription = Object.assign(new Subscription(), {
      subscriptionId: submitSubscriptionDomainServiceRequest.subscriptionId,
      offering: offering,
      investor: investor,
      lotUnits: submitSubscriptionDomainServiceRequest.lotUnits,
      status: SubscriptionStatus.SUBMITTED,
    })
    return await this.subscriptionRepository.save(subscription)
  }

  private async getOrCreateInvestor(accountId: string): Promise<Investor> {
    let investor = await this.investorRepository.findByAccountId(accountId)
    if (!investor) {
      investor = Object.assign(new Investor(), { accountId })
      investor = await this.investorRepository.save(investor)
    }
    return investor
  }
}
