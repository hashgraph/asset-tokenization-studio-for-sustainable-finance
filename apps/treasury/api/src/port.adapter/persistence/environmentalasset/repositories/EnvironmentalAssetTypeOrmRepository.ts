// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

@Singleton()
export class EnvironmentalAssetTypeOrmRepository implements EnvironmentalAssetRepository {
  constructor(
    @InjectRepository(TreasuryPersistence)
    private readonly treasuryRepository: Repository<EnvironmentalAssetPersistence>,
  ) {}

  @Validate()
  async save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset> {
    const persistence = await this.treasuryRepository.save(environmentalAsset as EnvironmentalAssetPersistence)
    return persistence as EnvironmentalAsset
  }
}
