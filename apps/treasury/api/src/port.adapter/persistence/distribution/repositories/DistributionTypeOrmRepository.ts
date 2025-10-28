// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
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

  @Validate()
  async save(distribution: Distribution): Promise<Distribution> {
    const persistence = await this.distributionRepository.save(distribution as DistributionPersistence)
    return persistence as Distribution
  }
}
