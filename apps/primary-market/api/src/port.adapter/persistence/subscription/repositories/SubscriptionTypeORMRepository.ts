// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionPersistence } from "../model/SubscriptionPersistence"
import { plainToInstance } from "class-transformer"

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

  async findBySubscriptionIdAndOfferingId(subscriptionId: string, offeringId: string): Promise<Subscription | null> {
    const persistence = await this.repository.findOne({
      where: {
        subscriptionId,
        offering: { offeringId },
      },
      relations: ["offering", "investor"],
    })

    return persistence ? this.toDomain(persistence) : null
  }

  async delete(subscription: Subscription): Promise<void> {
    await this.repository.remove(subscription as unknown as SubscriptionPersistence)
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

  private toDomain(persistence: SubscriptionPersistence): Subscription {
    return plainToInstance(Subscription, persistence)
  }
}
