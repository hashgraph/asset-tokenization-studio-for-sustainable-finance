// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"
import { DistributionHolderRepository } from "@domain/distribution/repositories/DistributionHolderRepository"

@Singleton()
export class DistributionHolderTypeOrmRepository implements DistributionHolderRepository {
  constructor(
    @InjectRepository(DistributionHolderPersistence)
    private readonly distributionHolderRepository: Repository<DistributionHolderPersistence>,
  ) {}

  @Validate()
  async save(distributionHolder: DistributionHolder): Promise<DistributionHolder> {
    const persistence = await this.distributionHolderRepository.save(
      distributionHolder as DistributionHolderPersistence,
    )
    return persistence as DistributionHolder
  }
}
