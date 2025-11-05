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

  async findByOfferingIdAndMarketId(offeringId: string, marketId: string): Promise<Offering | null> {
    const persistence = await this.repository.findOne({
      where: {
        offeringId,
        market: { contractId: marketId },
      },
      relations: ["market"],
    })

    return persistence ? this.toDomain(persistence) : null
  }

  async findUniqueBondIdsByMarketId(marketId: string, pageOptions: PageOptions): Promise<Page<string>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const baseQuery = this.repository
      .createQueryBuilder("offering")
      .innerJoin("offering.market", "market")
      .where("market.contractId = :marketId", { marketId })

    const result = await baseQuery.select("COUNT(DISTINCT offering.bondId)", "count").getRawOne<{ count: string }>()
    const total = Number(result?.count ?? 0)

    const paginatedBondIds = await baseQuery
      .select("DISTINCT offering.bondId", "bondId")
      .orderBy("offering.bondId", orderDirection)
      .offset((pageOptions.page - 1) * pageOptions.limit)
      .limit(pageOptions.limit)
      .getRawMany()

    return {
      items: paginatedBondIds.map((row) => row.bondId),
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async findByMarketIdAndBondId(marketId: string, bondId: string, pageOptions: PageOptions): Promise<Page<Offering>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: {
        market: { contractId: marketId },
        bondId,
      },
      relations: ["market"],
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
