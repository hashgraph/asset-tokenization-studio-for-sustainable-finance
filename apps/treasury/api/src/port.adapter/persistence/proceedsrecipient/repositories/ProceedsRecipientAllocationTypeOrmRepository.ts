// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate, Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { ProceedsRecipientAllocation } from "@domain/proceedsrecipient/model/ProceedsRecipientAllocation"
import { ProceedsRecipientAllocationPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientAllocationPersistence"
import { ProceedsRecipientAllocationRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientAllocationRepository"

@Singleton()
export class ProceedsRecipientAllocationTypeOrmRepository implements ProceedsRecipientAllocationRepository {
  constructor(
    @InjectRepository(ProceedsRecipientAllocationPersistence)
    private readonly proceedsRecipientAllocationRepository: Repository<ProceedsRecipientAllocationPersistence>,
  ) {}

  @Validate()
  async save(allocation: ProceedsRecipientAllocation): Promise<ProceedsRecipientAllocation> {
    const persistence = await this.proceedsRecipientAllocationRepository.save(
      allocation as ProceedsRecipientAllocationPersistence,
    )
    return persistence as ProceedsRecipientAllocation
  }

  async findByProceedsRecipientId(
    proceedsRecipientId: string,
    pageOptions: PageOptions,
  ): Promise<Page<ProceedsRecipientAllocation>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.proceedsRecipientAllocationRepository.findAndCount({
      where: { proceedsRecipientId },
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

  private toDomain(persistence: ProceedsRecipientAllocationPersistence): ProceedsRecipientAllocation {
    return { ...persistence } as ProceedsRecipientAllocation
  }
}
