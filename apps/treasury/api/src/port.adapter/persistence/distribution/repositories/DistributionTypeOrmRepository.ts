// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { Distribution } from "@domain/distribution/model/Distribution"
import { DistributionPersistence } from "@port/persistence/distribution/model/DistributionPersistence"
import { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"

@Singleton()
export class DistributionTypeOrmRepository implements DistributionRepository {
  constructor(
    @InjectRepository(DistributionPersistence)
    private readonly distributionRepository: Repository<DistributionPersistence>,
  ) {}

  async save(distribution: Distribution): Promise<Distribution> {
    const persistence = await this.distributionRepository.save(distribution as DistributionPersistence)
    return persistence as Distribution
  }

  async findById(id: number): Promise<Distribution | null> {
    const persistence = await this.distributionRepository.findOne({ where: { id } })
    return persistence ? (persistence as Distribution) : null
  }

  async findByTreasuryId(treasuryId: string, pageOptions: PageOptions): Promise<Page<Distribution>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.distributionRepository.findAndCount({
      where: { treasuryId },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as Distribution)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  async findById(id: number): Promise<Distribution | null> {
    const persistence = await this.distributionRepository.findOneBy({ id })
    return persistence ? (persistence as Distribution) : null
  }
}
