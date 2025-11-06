// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
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
    private readonly dataSource: DataSource,
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const saved = await this.repository.save(subscription as unknown as SubscriptionPersistence)
    return this.toDomain(saved)
  }

  async findBySubscriptionDltIdAndOfferingId(
    subscriptionDltId: string,
    offeringId: string,
  ): Promise<Subscription | null> {
    const persistence = await this.repository.findOne({
      where: {
        subscriptionDltId,
        offering: { id: offeringId },
      },
      relations: ["offering", "offering.market", "investor"],
    })

    return persistence ? this.toDomain(persistence) : null
  }

  async saveAll(subscriptions: Subscription[]): Promise<Subscription[]> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const saved = await queryRunner.manager.save(
        SubscriptionPersistence,
        subscriptions as unknown as SubscriptionPersistence[],
      )
      await queryRunner.commitTransaction()
      return saved.map((item) => this.toDomain(item))
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findByOfferingId(offeringId: string, pageOptions: PageOptions): Promise<Page<Subscription>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: {
        offering: { id: offeringId },
      },
      relations: ["offering", "offering.market", "investor"],
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as unknown as Subscription)

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
        investor: {
          accountId: investorAccountId,
        },
      },
      relations: ["offering", "offering.market", "investor"],
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as unknown as Subscription)

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
