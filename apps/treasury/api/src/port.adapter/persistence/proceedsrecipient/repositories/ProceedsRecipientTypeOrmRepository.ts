// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import { ProceedsRecipientPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientPersistence"
import { ProceedsRecipientRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientRepository"

@Singleton()
export class ProceedsRecipientTypeOrmRepository implements ProceedsRecipientRepository {
  constructor(
    @InjectRepository(ProceedsRecipientPersistence)
    private readonly proceedsRecipientRepository: Repository<ProceedsRecipientPersistence>,
  ) {}

  @Validate()
  async save(proceedsRecipient: ProceedsRecipient): Promise<ProceedsRecipient> {
    const persistence = await this.proceedsRecipientRepository.save(proceedsRecipient as ProceedsRecipientPersistence)
    return persistence as ProceedsRecipient
  }

  async findByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<ProceedsRecipient | null> {
    const persistence = await this.proceedsRecipientRepository
      .createQueryBuilder("proceedsRecipient")
      .innerJoin("proceedsRecipient.treasury", "treasury")
      .where("proceedsRecipient.contractId = :contractId", { contractId })
      .andWhere("treasury.contractId = :treasuryContractId", { treasuryContractId })
      .getOne()

    return persistence ? (persistence as ProceedsRecipient) : null
  }

  async findByTreasuryId(treasuryId: string, pageOptions: PageOptions): Promise<Page<ProceedsRecipient>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.proceedsRecipientRepository.findAndCount({
      where: { treasuryId },
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as ProceedsRecipient)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }
}
