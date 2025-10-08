import { Repository, IsNull } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetPersistence } from "../model/EnvironmentalAssetPersistence"
import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"

@Singleton()
export class EnvironmentalAssetTypeOrmRepository implements EnvironmentalAssetRepository {
  constructor(
    @InjectRepository(EnvironmentalAssetPersistence)
    private readonly repository: Repository<EnvironmentalAssetPersistence>,
  ) {}

  @Validate()
  async save(environmentalAsset: EnvironmentalAsset): Promise<EnvironmentalAsset> {
    const savedPersistence = await this.repository.save(environmentalAsset)
    return this.toDomain(savedPersistence)
  }

  async findByAssetIdAndTreasuryId(assetId: string, treasuryId: string): Promise<EnvironmentalAsset | null> {
    const persistence = await this.findActivePersistence(assetId, treasuryId)
    return persistence ? this.toDomain(persistence) : null
  }

  async softDeleteByAssetIdAndTreasuryId(assetId: string, treasuryId: string): Promise<EnvironmentalAsset> {
    const persistence = await this.findActivePersistence(assetId, treasuryId)

    if (!persistence) {
      throw EnvironmentalAssetNotFoundError.idError(assetId)
    }

    persistence.deletedAt = new Date()
    const updatedPersistence = await this.repository.save(persistence)
    return this.toDomain(updatedPersistence)
  }

  private async findActivePersistence(
    assetId: string,
    treasuryId: string,
  ): Promise<EnvironmentalAssetPersistence | null> {
    return this.repository.findOne({
      where: {
        assetId: assetId,
        treasuryId,
        deletedAt: IsNull(),
      },
    })
  }

  private toDomain(persistence: EnvironmentalAssetPersistence): EnvironmentalAsset {
    return { ...persistence } as EnvironmentalAsset
  }
}
