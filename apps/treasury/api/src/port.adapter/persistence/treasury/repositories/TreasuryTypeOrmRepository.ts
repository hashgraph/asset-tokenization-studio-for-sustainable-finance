// SPDX-License-Identifier: Apache-2.0

import { BaseRepository, Page, PageOptions, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { Treasury } from "@domain/treasury/model/Treasury"
import { plainToInstance } from "class-transformer"

@Singleton()
export class TreasuryTypeOrmRepository extends BaseRepository<TreasuryPersistence> implements TreasuryRepository {
  constructor() {
    super(TreasuryPersistence)
  }

  @Validate()
  async save(treasury: Treasury, transactionId?: string): Promise<Treasury> {
    const persistence = await this.getRepository(transactionId).save(treasury as TreasuryPersistence)
    return persistence as Treasury
  }

  async findByContractId(contractId: string): Promise<Treasury | null> {
    const persistence = await this.getRepository().findOne({
      where: { contractId },
      relations: ["paymentToken"],
    })
    return this.toDomain(persistence)
  }

  async findByBondContractId(bondContractId: string): Promise<Treasury | null> {
    return this.toDomain(await this.getRepository().findOneBy({ bondContractId }))
  }

  async findAll(pageOptions: PageOptions): Promise<Page<Treasury>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.getRepository().findAndCount({
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
      relations: ["paymentToken"],
    })

    const items = persistences.map((p) => this.toDomain(p)!)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  private toDomain(persistence: TreasuryPersistence | null): Treasury | null {
    return persistence ? plainToInstance(Treasury, persistence) : null
  }
}
