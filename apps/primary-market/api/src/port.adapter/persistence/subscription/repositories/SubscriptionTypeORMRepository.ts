// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SubscriptionRepository } from "@domain/subscription/repositories/SubscriptionRepository"
import { Subscription } from "@domain/subscription/model/Subscription"
import { SubscriptionPersistence } from "../model/SubscriptionPersistence"
import { plainToInstance } from "class-transformer"

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

  async findBySubscriptionId(subscriptionId: string): Promise<Subscription | null> {
    const persistence = await this.repository.findOne({
      where: { subscriptionId },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: SubscriptionPersistence): Subscription {
    return plainToInstance(Subscription, persistence)
  }
}
