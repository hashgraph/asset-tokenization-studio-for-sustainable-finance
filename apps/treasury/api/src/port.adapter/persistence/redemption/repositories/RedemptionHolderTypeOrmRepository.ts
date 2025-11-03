// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate, Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { RedemptionHolderPersistence } from "../model/RedemptionHolderPersistence"

@Singleton()
export class RedemptionHolderTypeOrmRepository implements RedemptionHolderRepository {
  constructor(
    @InjectRepository(RedemptionHolderPersistence)
    private readonly redemptionHolderRepository: Repository<RedemptionHolderPersistence>,
  ) {}

  @Validate()
  async save(redemptionHolder: RedemptionHolder): Promise<RedemptionHolder> {
    const persistence = await this.redemptionHolderRepository.save(redemptionHolder as RedemptionHolderPersistence)
    return persistence as RedemptionHolder
  }

  async findByTreasuryId(
    treasuryId: string,
    pageOptions: PageOptions,
    status?: string,
  ): Promise<Page<RedemptionHolder>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const whereCondition: any = { treasuryId }
    if (status) {
      whereCondition.status = status
    }

    const [persistences, total] = await this.redemptionHolderRepository.findAndCount({
      where: whereCondition,
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as RedemptionHolder)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }
}
