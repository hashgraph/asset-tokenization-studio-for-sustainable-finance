// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "../model/PrimaryMarketPersistence"
import { PrimaryMarketRepository } from "@domain/primarymarket/repositories/PrimaryMarketRepository"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"
import { plainToInstance } from "class-transformer"

@Injectable()
export class PrimaryMarketTypeORMRepository implements PrimaryMarketRepository {
  constructor(
    @InjectRepository(PrimaryMarketPersistence)
    private readonly repository: Repository<PrimaryMarketPersistence>,
  ) {}

  async findByContractId(contractId: string): Promise<PrimaryMarket | null> {
    const persistence = await this.repository.findOne({
      where: { contractId },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: PrimaryMarketPersistence): PrimaryMarket {
    return plainToInstance(PrimaryMarket, persistence)
  }
}
