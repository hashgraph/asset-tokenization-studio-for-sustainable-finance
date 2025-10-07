import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"

@Singleton()
export class RemoveEnvironmentalAssetDomainService {
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
  ) {}

  async execute(operatorAddress: string, erc721: string): Promise<EnvironmentalAsset> {
    const treasury = await this.treasuryRepository.findByContractAddress(operatorAddress)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([operatorAddress])
    }

    await this.checkEnvironmentalAssetExists.execute(erc721)

    const deletedAsset = await this.environmentalAssetRepository.softDelete(erc721)

    return deletedAsset
  }
}
