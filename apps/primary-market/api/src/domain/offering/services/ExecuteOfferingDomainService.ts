// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "./CheckOfferingExistsDomainService"
import { UpdateSubscriptionsStatusDomainService } from "@domain/subscription/services/UpdateSubscriptionsStatusDomainService"
import { ExecuteOfferingDomainServiceRequest } from "./model/ExecuteOfferingDomainServiceRequest"

@Singleton()
export class ExecuteOfferingDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly updateSubscriptionsStatusDomainService: UpdateSubscriptionsStatusDomainService,
  ) {}

  async execute(request: ExecuteOfferingDomainServiceRequest): Promise<void> {
    const { marketContractId, offeringId, operatorId, subscriptionIdsSuccess, subscriptionIdsFailed } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    market.checkActive()

    const existingOffering = await this.checkOfferingExistsDomainService.execute(offeringId, market)

    existingOffering.checkOperator(operatorId)

    const subscriptionsToUpdate = [
      ...(await this.updateSubscriptionsStatusDomainService.execute(
        subscriptionIdsSuccess,
        existingOffering,
        SubscriptionStatus.EXECUTED,
      )),
      ...(await this.updateSubscriptionsStatusDomainService.execute(
        subscriptionIdsFailed,
        existingOffering,
        SubscriptionStatus.FAILED,
      )),
    ]

    if (subscriptionsToUpdate.length > 0) {
      await this.subscriptionRepository.saveAll(subscriptionsToUpdate)
    }
  }
}
