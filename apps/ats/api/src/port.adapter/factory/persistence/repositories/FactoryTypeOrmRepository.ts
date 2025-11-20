// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FactoryPersistence } from "../model/FactoryPersistence"
import { FactoryRepository } from "@domain/factory/repositories/FactoryRepository"
import { Factory } from "@domain/factory/model/Factory"
import { plainToInstance } from "class-transformer"

@Injectable()
export class FactoryTypeOrmRepository implements FactoryRepository {
  constructor(
    @InjectRepository(FactoryPersistence)
    private readonly repository: Repository<FactoryPersistence>,
  ) {}

  async save(factory: Factory): Promise<Factory> {
    const persistence = await this.repository.save(factory)
    return this.toDomain(persistence)!
  }

  async findByFactoryId(factoryId: string): Promise<Factory | null> {
    const persistence = await this.repository.findOne({
      where: { factoryId },
    })

    return this.toDomain(persistence)
  }

  private toDomain(persistence: FactoryPersistence | null): Factory | null {
    return persistence ? plainToInstance(Factory, persistence) : null
  }
}
