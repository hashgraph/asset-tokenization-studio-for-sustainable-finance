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
  async save(environmentalAsset: EnvironmentalAsset): Promise<void> {
    const persistenceData: Partial<EnvironmentalAssetPersistence> = {
      id: environmentalAsset.id,
      contractId: environmentalAsset.contractId,
      treasuryId: environmentalAsset.treasury,
      deletedAt: environmentalAsset.deletedAt,
    }
    await this.repository.save(persistenceData)
  }

  async findByContractId(contractId: string): Promise<EnvironmentalAsset | null> {
    const persistence = await this.repository.findOne({ where: { contractId } })
    if (!persistence) {
      return null
    }
    return { ...persistence, treasury: persistence.treasuryId } as EnvironmentalAsset
  }

  async softDeleteByContractId(contractId: string): Promise<EnvironmentalAsset> {
    await this.repository.softDelete({ contractId })
    const persistence = await this.repository.findOne({ where: { contractId }, withDeleted: true })
    return { ...persistence!, treasury: persistence!.treasuryId } as EnvironmentalAsset
  }
}
