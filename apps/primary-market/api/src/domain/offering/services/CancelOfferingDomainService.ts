// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "./CheckOfferingExistsDomainService"
import { UpdateSubscriptionsStatusDomainService } from "@domain/subscription/services/UpdateSubscriptionsStatusDomainService"
import { CancelOfferingDomainServiceRequest } from "./model/CancelOfferingDomainServiceRequest"

@Singleton()
export class CancelOfferingDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly updateSubscriptionsStatusDomainService: UpdateSubscriptionsStatusDomainService,
  ) {}

  async execute(request: CancelOfferingDomainServiceRequest): Promise<void> {
    const { marketContractId, offeringDltId, operatorAccountId, subscriptionDltIdsSuccess, subscriptionDltIdsFailed } =
      request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    market.ensureActive()

    const existingOffering = await this.checkOfferingExistsDomainService.execute(offeringDltId, market)

    existingOffering.ensureOperatorMatches(operatorAccountId)

    const subscriptionsToUpdate = [
      ...(await this.updateSubscriptionsStatusDomainService.execute(
        subscriptionDltIdsSuccess,
        existingOffering,
        SubscriptionStatus.CANCELLED,
      )),
      ...(await this.updateSubscriptionsStatusDomainService.execute(
        subscriptionDltIdsFailed,
        existingOffering,
        SubscriptionStatus.FAILED,
      )),
    ]

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }
}
