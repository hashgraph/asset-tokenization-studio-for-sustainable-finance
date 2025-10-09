import { Repository, IsNull } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
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
    const savedPersistence = await this.repository.save(environmentalAsset)
    return this.toDomain(savedPersistence)
  }

  async findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<EnvironmentalAsset | null> {
    const persistence = await this.findActivePersistence(contractId, treasuryId)
    return persistence ? this.toDomain(persistence) : null
  }

  private async findActivePersistence(
    contractId: string,
    treasuryId: string,
  ): Promise<EnvironmentalAssetPersistence | null> {
    return this.repository.findOne({
      where: {
        contractId: contractId,
        treasuryId: treasuryId,
        validityDate: IsNull(),
      },
    })
  }

  private toDomain(persistence: EnvironmentalAssetPersistence): EnvironmentalAsset {
    return { ...persistence } as EnvironmentalAsset
  }
}
