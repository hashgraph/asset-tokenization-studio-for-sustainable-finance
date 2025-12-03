// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { OfferingRepository } from "@domain/offering/repositories/OfferingRepository"
import { Offering } from "@domain/offering/model/Offering"
import { OfferingPersistence } from "../model/OfferingPersistence"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class OfferingTypeORMRepository implements OfferingRepository {
  constructor(
    @InjectRepository(OfferingPersistence)
    private readonly repository: Repository<OfferingPersistence>,
  ) {}

  async save(offering: Offering): Promise<Offering> {
    const saved = await this.repository.save(offering as unknown as OfferingPersistence)
    return this.toDomain(saved)
  }

  async findByOfferingIdAndMarketId(offeringId: number, marketId: string): Promise<Offering | null> {
    const persistence = await this.repository.findOne({
      where: {
        id: offeringId,
        marketId: marketId,
      },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  async findUniqueBondContractIdsByMarketId(marketId: string, pageOptions: PageOptions): Promise<Page<string>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const baseQuery = this.repository
      .createQueryBuilder("offering")
      .where("offering.marketId = :marketId", { marketId })

    const result = await baseQuery
      .select("COUNT(DISTINCT offering.bondContractId)", "count")
      .getRawOne<{ count: string }>()
    const total = Number(result?.count ?? 0)

    const paginatedBondContractIds = await baseQuery
      .select("DISTINCT offering.bondContractId", "bondContractId")
      .orderBy("offering.bondContractId", orderDirection)
      .offset((pageOptions.page - 1) * pageOptions.limit)
      .limit(pageOptions.limit)
      .getRawMany()

    return {
      items: paginatedBondContractIds.map((row) => row.bondContractId),
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async findByMarketIdAndBondContractId(
    marketId: string,
    bondContractId: string,
    pageOptions: PageOptions,
  ): Promise<Page<Offering>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: {
        marketId: marketId,
        bondContractId,
      },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async findByMarketId(marketId: string, pageOptions: PageOptions): Promise<Page<Offering>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: {
        marketId: marketId,
      },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  private toDomain(persistence: OfferingPersistence): Offering {
    return plainToInstance(Offering, persistence)
  }
}
