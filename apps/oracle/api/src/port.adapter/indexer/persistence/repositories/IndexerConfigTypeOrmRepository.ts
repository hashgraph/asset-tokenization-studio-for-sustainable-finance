// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { plainToInstance } from "class-transformer"
import type { IndexerConfigRepository } from "@domain/indexer/repositories/IndexerConfigRepository"
import { IndexerConfig } from "@domain/indexer/model/IndexerConfig"
import { IndexerConfigPersistence } from "../model/IndexerConfigPersistence"

@Injectable()
export class IndexerConfigTypeOrmRepository implements IndexerConfigRepository {
  constructor(
    @InjectRepository(IndexerConfigPersistence)
    private readonly repository: Repository<IndexerConfigPersistence>,
  ) {}

  async save(config: IndexerConfig): Promise<IndexerConfig> {
    // Ensure singleton: delete all existing configs before saving
    const existing = await this.repository.find()
    if (existing.length > 0) {
      await this.repository.remove(existing)
    }

    const persistence = this.toPersistence(config)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)!
  }

  async findConfig(): Promise<IndexerConfig | null> {
    const persistence = await this.repository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })
    return this.toDomain(persistence)
  }

  async getOrCreateDefault(): Promise<IndexerConfig> {
    let config = await this.findConfig()
    if (!config) {
      const defaultConfig = new IndexerConfig(
        undefined as unknown as string,
        process.env.INDEXER_ENDPOINT || "",
        process.env.INDEXER_API_KEY || "",
        new Date(),
        new Date(),
      )
      config = await this.save(defaultConfig)
    }
    return config
  }

  private toDomain(persistence: IndexerConfigPersistence | null): IndexerConfig | null {
    return persistence ? plainToInstance(IndexerConfig, persistence) : null
  }

  private toPersistence(config: IndexerConfig): IndexerConfigPersistence {
    const persistence = new IndexerConfigPersistence()
    if (config.id) {
      persistence.id = config.id
    }
    persistence.endpoint = config.endpoint
    persistence.apiKey = config.apiKey
    return persistence
  }
}
