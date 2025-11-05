// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "../model/PrimaryMarketPersistence"
import { PrimaryMarketRepository } from "@domain/primarymarket/repositories/PrimaryMarketRepository"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

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

  async findAll(options: PageOptions): Promise<Page<PrimaryMarket>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as unknown as PrimaryMarket)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  private toDomain(persistence: PrimaryMarketPersistence): PrimaryMarket {
    return plainToInstance(PrimaryMarket, persistence)
  }
}
