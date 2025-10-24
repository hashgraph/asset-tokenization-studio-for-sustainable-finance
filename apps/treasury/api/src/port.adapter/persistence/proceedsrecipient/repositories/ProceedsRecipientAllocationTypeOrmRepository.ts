// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
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
}
