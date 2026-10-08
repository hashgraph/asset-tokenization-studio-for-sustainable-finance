// SPDX-License-Identifier: Apache-2.0
import { IsNull, Not } from "typeorm"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetPersistence } from "../model/EnvironmentalAssetPersistence"
import { BaseRepository, Page, PageOptions, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { plainToInstance } from "class-transformer"

@Singleton()
export class EnvironmentalAssetTypeOrmRepository
  extends BaseRepository<EnvironmentalAssetPersistence>
  implements EnvironmentalAssetRepository
{
  constructor() {
    super(EnvironmentalAssetPersistence)
  }

  @Validate()
  async save(environmentalAsset: EnvironmentalAsset, transactionId?: string): Promise<EnvironmentalAsset> {
    const savedPersistence = await this.getRepository(transactionId).save(this.fromDomain(environmentalAsset))
    return this.toDomain(savedPersistence)
  }

  async findByContractId(contractId: string): Promise<EnvironmentalAsset | null> {
    const persistence = await this.getRepository().findOne({
      where: {
        contractId: contractId,
        removalDate: IsNull(),
      },
    })
    return persistence ? this.toDomain(persistence) : null
  }

  async findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<EnvironmentalAsset | null> {
    const persistence = await this.findActivePersistence(contractId, treasuryId)
    return persistence ? this.toDomain(persistence) : null
  }

  private async findActivePersistence(
    contractId: string,
    treasuryId: string,
  ): Promise<EnvironmentalAssetPersistence | null> {
    return this.getRepository().findOne({
      where: {
        contractId,
        treasuryId,
        removalDate: IsNull(),
      },
    })
  }

  async findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<EnvironmentalAsset>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.getRepository().findAndCount({
      where: { treasuryId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => this.toDomain(p))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async existsByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
    removed?: boolean,
  ): Promise<boolean> {
    return this.getRepository().exists({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: removed ? Not(IsNull()) : IsNull(),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
  }

  async findByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<EnvironmentalAsset | null> {
    const persistence = await this.getRepository().findOne({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: IsNull(),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
    return persistence ? this.toDomain(persistence) : null
  }

  async findAllRemovedByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<EnvironmentalAsset[]> {
    const persistences = await this.getRepository().find({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: Not(IsNull()),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
    return persistences.map((persistence) => this.toDomain(persistence))
  }

  private toDomain(persistence: EnvironmentalAssetPersistence): EnvironmentalAsset {
    return plainToInstance(EnvironmentalAsset, persistence)
  }

  private fromDomain(domainEntity: EnvironmentalAsset): EnvironmentalAssetPersistence {
    return plainToInstance(EnvironmentalAssetPersistence, domainEntity)
  }
}
