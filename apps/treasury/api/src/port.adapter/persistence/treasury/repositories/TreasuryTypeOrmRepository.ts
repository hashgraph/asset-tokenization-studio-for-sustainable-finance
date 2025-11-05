// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { Treasury } from "@domain/treasury/model/Treasury"
import { plainToInstance } from "class-transformer"

@Singleton()
export class TreasuryTypeOrmRepository implements TreasuryRepository {
  constructor(
    @InjectRepository(TreasuryPersistence)
    private readonly treasuryRepository: Repository<TreasuryPersistence>,
  ) {}

  @Validate()
  async save(treasury: Treasury): Promise<Treasury> {
    const persistence = await this.treasuryRepository.save(treasury as TreasuryPersistence)
    return persistence as Treasury
  }

  async findByContractId(contractId: string): Promise<Treasury | null> {
    const persistence = await this.treasuryRepository.findOne({
      where: { contractId },
      relations: ["paymentToken"],
    })
    return this.toDomain(persistence)
  }

  async findByBondContractId(bondContractId: string): Promise<Treasury | null> {
    return this.toDomain(await this.treasuryRepository.findOneBy({ bondContractId }))
  }

  async findAll(pageOptions: PageOptions): Promise<Page<Treasury>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.treasuryRepository.findAndCount({
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
