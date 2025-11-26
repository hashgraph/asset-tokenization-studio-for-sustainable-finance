// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate, Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"
import { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"
import { plainToInstance } from "class-transformer"

@Singleton()
export class DistributionHolderTypeOrmRepository implements DistributionHolderRepository {
  constructor(
    @InjectRepository(DistributionHolderPersistence)
    private readonly distributionHolderRepository: Repository<DistributionHolderPersistence>,
  ) {}

  @Validate()
  async save(distributionHolder: DistributionHolder): Promise<DistributionHolder> {
    const persistence = await this.distributionHolderRepository.save(this.fromDomain(distributionHolder))
    return this.toDomain(persistence)
  }

  async existsByDistributionIdAndHolderAccountId(distributionId: number, holderAccountId: string): Promise<boolean> {
    return await this.distributionHolderRepository.existsBy({ distributionId, holderAccountId })
  }

  async findOneByDistributionIdAndHolderAccountId(
    distributionId: number,
    holderAccountId: string,
  ): Promise<DistributionHolder> {
    const persistence = await this.distributionHolderRepository.findOneBy({ distributionId, holderAccountId })
    return this.toDomain(persistence)
  }

  async findByDistributionId(
    distributionId: number,
    pageOptions: PageOptions,
    status?: string,
  ): Promise<Page<DistributionHolder>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const whereCondition: any = { distributionId }
    if (status) {
      whereCondition.status = status
    }

    const [persistences, total] = await this.distributionHolderRepository.findAndCount({
      where: whereCondition,
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

  private toDomain(persistence: DistributionHolderPersistence | null): DistributionHolder {
    return plainToInstance(DistributionHolder, persistence)
  }

  private fromDomain(domainEntity: DistributionHolder): DistributionHolderPersistence {
    return plainToInstance(DistributionHolderPersistence, domainEntity)
  }
}
