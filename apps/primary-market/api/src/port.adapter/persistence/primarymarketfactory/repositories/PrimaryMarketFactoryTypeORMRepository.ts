// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PrimaryMarketFactoryPersistence } from "../model/PrimaryMarketFactoryPersistence"
import { PrimaryMarketFactoryRepository } from "@domain/primarymarketfactory/repositories/PrimaryMarketFactoryRepository"
import { PrimaryMarketFactory } from "@domain/primarymarketfactory/model/PrimaryMarketFactory"
import { plainToInstance } from "class-transformer"

@Injectable()
export class PrimaryMarketFactoryTypeORMRepository implements PrimaryMarketFactoryRepository {
  constructor(
    @InjectRepository(PrimaryMarketFactoryPersistence)
    private readonly repository: Repository<PrimaryMarketFactoryPersistence>,
  ) {}

  async save(factory: PrimaryMarketFactory): Promise<PrimaryMarketFactory> {
    const persistence = await this.repository.save(factory)
    return this.toDomain(persistence)!
  }

  async findByContractId(contractId: string): Promise<PrimaryMarketFactory | null> {
    const persistence = await this.repository.findOne({
      where: { contractId: contractId },
    })

    return this.toDomain(persistence)
  }

  private toDomain(persistence: PrimaryMarketFactoryPersistence | null): PrimaryMarketFactory | null {
    return persistence ? plainToInstance(PrimaryMarketFactory, persistence) : null
  }
}
