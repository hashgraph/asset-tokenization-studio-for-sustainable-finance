import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { EnvironmentalAsset } from "../../../../domain/environmentalasset/model/EnvironmentalAsset"
import { EnvironmentalAssetRepository } from "../../../../domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetPersistence } from "../model/EnvironmentalAssetPersistence"
import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class EnvironmentalAssetTypeOrmRepository implements EnvironmentalAssetRepository {
  constructor(
    @InjectRepository(EnvironmentalAssetPersistence)
    private readonly repository: Repository<EnvironmentalAssetPersistence>,
  ) {}

  @Validate()
  async save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset> {
    const persistenceData: Partial<EnvironmentalAssetPersistence> = {
      id: environmentalAsset.id,
      treasuryId: environmentalAsset.treasury,
      deletedAt: environmentalAsset.deletedAt,
    }
    const persistence = await this.repository.save(persistenceData)
    return { ...persistence, treasury: persistence.treasuryId } as EnvironmentalAsset
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update({ id }, { deletedAt: new Date() })
  }
}
