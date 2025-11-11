// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionPersistence } from "../model/SubscriptionPersistence"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class SubscriptionTypeORMRepository implements SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionPersistence)
    private readonly repository: Repository<SubscriptionPersistence>,
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const saved = await this.repository.save(subscription as unknown as SubscriptionPersistence)
    return this.toDomain(saved)
  }

  async findBySubscriptionIdAndOfferingIdAndMarketId(
    subscriptionId: number,
    offeringId: number,
    marketId: string,
  ): Promise<Subscription | null> {
    const persistence = await this.repository.findOne({
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

    const [persistences, total] = await this.repository.findAndCount({
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

    const [persistences, total] = await this.repository.findAndCount({
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
