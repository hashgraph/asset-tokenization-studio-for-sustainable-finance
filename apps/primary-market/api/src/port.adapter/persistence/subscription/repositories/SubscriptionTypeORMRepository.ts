// SPDX-License-Identifier: Apache-2.0

import { Singleton, Page, PageOptions, BaseRepository } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionPersistence } from "../model/SubscriptionPersistence"
import { plainToInstance } from "class-transformer"

@Singleton()
export class SubscriptionTypeORMRepository
  extends BaseRepository<SubscriptionPersistence>
  implements SubscriptionRepository
{
  constructor() {
    super(SubscriptionPersistence)
  }

  async save(subscription: Subscription, transactionId?: string): Promise<Subscription> {
    const saved = await this.getRepository(transactionId).save(subscription as unknown as SubscriptionPersistence)
    return this.toDomain(saved)
  }

  async findBySubscriptionIdOfferingIdAndMarketId(
    subscriptionId: number,
    offeringId: number,
    marketId: string,
  ): Promise<Subscription | null> {
    const persistence = await this.getRepository().findOne({
      where: {
        id: subscriptionId,
        offeringId,
        marketId,
      },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  async findByOfferingIdAndMarketId(
    offeringId: number,
    marketId: string,
    pageOptions: PageOptions,
  ): Promise<Page<Subscription>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.getRepository().findAndCount({
      where: {
        offeringId,
        marketId,
      },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async findByInvestorAccountId(investorAccountId: string, pageOptions: PageOptions): Promise<Page<Subscription>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.getRepository().findAndCount({
      where: {
        investorAccountId,
      },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  private toDomain(persistence: SubscriptionPersistence): Subscription {
    return plainToInstance(Subscription, persistence)
  }
}
