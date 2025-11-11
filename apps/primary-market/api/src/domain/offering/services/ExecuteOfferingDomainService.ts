// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import type { TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "./CheckOfferingExistsDomainService"
import { UpdateSubscriptionsStatusDomainService } from "@domain/subscription/services/UpdateSubscriptionsStatusDomainService"
import { ExecuteOfferingDomainServiceRequest } from "./model/ExecuteOfferingDomainServiceRequest"

@Singleton()
export class ExecuteOfferingDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    @Inject() private readonly transactionManager: TransactionManager,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly updateSubscriptionsStatusDomainService: UpdateSubscriptionsStatusDomainService,
  ) {}

  async execute(request: ExecuteOfferingDomainServiceRequest): Promise<void> {
    const { marketContractId, offeringId, operatorAccountId, subscriptionIdsSuccess, subscriptionIdsFailed } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    market.ensureActive()

    const existingOffering = await this.checkOfferingExistsDomainService.execute(offeringId, market)

    existingOffering.ensureOperatorMatches(operatorAccountId)

    await this.transactionManager.execute(async () => {
      const subscriptionsToUpdate = [
        ...(await this.updateSubscriptionsStatusDomainService.execute(
          subscriptionIdsSuccess,
          existingOffering.id,
          market,
          SubscriptionStatus.EXECUTED,
        )),
        ...(await this.updateSubscriptionsStatusDomainService.execute(
          subscriptionIdsFailed,
          existingOffering.id,
          market,
          SubscriptionStatus.FAILED,
        )),
      ]

      for (const subscription of subscriptionsToUpdate) {
        await this.subscriptionRepository.save(subscription)
      }
    })
  }
}
