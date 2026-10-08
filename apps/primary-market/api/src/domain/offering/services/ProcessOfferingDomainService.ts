// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import type { TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { OfferingProcessStatus } from "@domain/shared/model/OfferingProcessStatus"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CheckOfferingExistsDomainService } from "./CheckOfferingExistsDomainService"
import { CheckSubscriptionExistsDomainService } from "@domain/subscription/services/CheckSubscriptionExistsDomainService"
import { ProcessOfferingDomainServiceRequest } from "./model/ProcessOfferingDomainServiceRequest"
import { Subscription } from "@domain/subscription/model/Subscription"

@Singleton()
export class ProcessOfferingDomainService {
  constructor(
    @Inject() private readonly subscriptionRepository: SubscriptionRepository,
    @Inject() private readonly transactionManager: TransactionManager,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    private readonly checkOfferingExistsDomainService: CheckOfferingExistsDomainService,
    private readonly checkSubscriptionExistsDomainService: CheckSubscriptionExistsDomainService,
  ) {}

  async execute(request: ProcessOfferingDomainServiceRequest): Promise<void> {
    const { marketContractId, offeringId, operatorAccountId, processResults } = request

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)
    market.ensureActive()

    const existingOffering = await this.checkOfferingExistsDomainService.execute(offeringId, market)

    existingOffering.ensureOperatorMatches(operatorAccountId)

    await this.transactionManager.execute(async (transactionId) => {
      const subscriptionsToUpdate: Subscription[] = []

      for (const result of processResults) {
        const subscription = await this.checkSubscriptionExistsDomainService.execute(
          Number(result.subscriptionId),
          existingOffering.id,
          market,
        )

        switch (result.status) {
          case OfferingProcessStatus.SUCCEEDED:
            subscription.status = SubscriptionStatus.EXECUTED
            subscription.updatedAt = new Date()
            subscriptionsToUpdate.push(subscription)
            break

          case OfferingProcessStatus.FAILED:
            subscription.status = SubscriptionStatus.FAILED
            subscription.updatedAt = new Date()
            subscriptionsToUpdate.push(subscription)
            break

          case OfferingProcessStatus.ALREADY_PROCESSED:
            break

          default:
            throw new Error("Unknown OfferingProcessStatus")
        }
      }

      for (const subscription of subscriptionsToUpdate) {
        await this.subscriptionRepository.save(subscription, transactionId)
      }
    })
  }
}
