// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { plainToInstance } from "class-transformer"
import type { BlockchainConfigRepository } from "@domain/blockchain/repositories/BlockchainConfigRepository"
import { BlockchainConfig } from "@domain/blockchain/model/BlockchainConfig"
import { BlockchainConfigPersistence } from "../model/BlockchainConfigPersistence"

@Injectable()
export class BlockchainConfigTypeOrmRepository implements BlockchainConfigRepository {
  constructor(
    @InjectRepository(BlockchainConfigPersistence)
    private readonly repository: Repository<BlockchainConfigPersistence>,
  ) {}

  async save(config: BlockchainConfig): Promise<BlockchainConfig> {
    // Ensure singleton: delete all existing configs before saving
    const existing = await this.repository.find()
    if (existing.length > 0) {
      await this.repository.remove(existing)
    }

    const persistence = this.toPersistence(config)
    const saved = await this.repository.save(persistence)
    return this.toDomain(saved)!
  }

  async findConfig(): Promise<BlockchainConfig | null> {
    const persistence = await this.repository.findOne({
      where: {},
      order: { createdAt: "DESC" },
    })
    return this.toDomain(persistence)
  }

  async getOrCreateDefault(): Promise<BlockchainConfig> {
    let config = await this.findConfig()
    if (!config) {
      const defaultConfig = new BlockchainConfig(
        undefined as unknown as string,
        process.env.HEDERA_NETWORK || "testnet",
        process.env.RPC_ENDPOINT || "https://testnet.hashio.io/api",
        process.env.HEDERA_USE_JSON_RPC === "true",
        new Date(),
        new Date(),
      )
      config = await this.save(defaultConfig)
    }
    return config
  }

  private toDomain(persistence: BlockchainConfigPersistence | null): BlockchainConfig | null {
    return persistence ? plainToInstance(BlockchainConfig, persistence) : null
  }

  private toPersistence(config: BlockchainConfig): BlockchainConfigPersistence {
    const persistence = new BlockchainConfigPersistence()
    if (config.id) {
      persistence.id = config.id
    }
    persistence.network = config.network
    persistence.rpcEndpoint = config.rpcEndpoint
    persistence.useJsonRpc = config.useJsonRpc
    return persistence
  }
}
