// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { plainToInstance } from "class-transformer"
import type { SchedulerConfigRepository } from "@domain/scheduler/repositories/SchedulerConfigRepository"
import { SchedulerConfig } from "@domain/scheduler/model/SchedulerConfig"
import { SchedulerConfigPersistence } from "../model/SchedulerConfigPersistence"

@Injectable()
export class SchedulerConfigTypeOrmRepository implements SchedulerConfigRepository {
  constructor(
    @InjectRepository(SchedulerConfigPersistence)
    private readonly repository: Repository<SchedulerConfigPersistence>,
  ) {}

  async save(config: SchedulerConfig): Promise<SchedulerConfig> {
    // Ensure singleton: delete all existing configs before saving
    const existing = await this.repository.find()
    if (existing.length > 0) {
      await this.repository.remove(existing)
    }

    const persistence = this.toPersistence(config)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)!
  }

  async findConfig(): Promise<SchedulerConfig | null> {
    const persistence = await this.repository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })
    return this.toDomain(persistence)
  }

  async getOrCreateDefault(): Promise<SchedulerConfig> {
    let config = await this.findConfig()
    if (!config) {
      const defaultConfig = new SchedulerConfig(
        undefined as unknown as string,
        process.env.SCHEDULER_CRON_EXPRESSION || "*/1 * * * *",
        parseInt(process.env.SCHEDULER_CONCURRENCY_LIMIT || "5", 10),
        process.env.SCHEDULER_ENABLED === "true",
        new Date(),
        new Date(),
      )
      config = await this.save(defaultConfig)
    }
    return config
  }

  private toDomain(persistence: SchedulerConfigPersistence | null): SchedulerConfig | null {
    return persistence ? plainToInstance(SchedulerConfig, persistence) : null
  }

  private toPersistence(config: SchedulerConfig): SchedulerConfigPersistence {
    const persistence = new SchedulerConfigPersistence()
    if (config.id) {
      persistence.id = config.id
    }
    persistence.cronExpression = config.cronExpression
    persistence.concurrencyLimit = config.concurrencyLimit
    persistence.enabled = config.enabled
    return persistence
  }
}
