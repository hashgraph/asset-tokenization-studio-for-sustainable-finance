import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { RemoveEnvironmentalAssetServiceResponse } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetServiceResponse"

@Singleton()
export class RemoveEnvironmentalAssetDomainService {
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
  ) {}

  async execute(operatorAddress: string, erc721: string): Promise<RemoveEnvironmentalAssetServiceResponse> {
    const treasury = await this.treasuryRepository.findByContractAddress(operatorAddress)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([operatorAddress])
    }

    await this.checkEnvironmentalAssetExists.execute(erc721, treasury.id)

    const deletedAsset = await this.environmentalAssetRepository.softDeleteByContractIdAndTreasuryId(
      erc721,
      treasury.id,
    )

    return new RemoveEnvironmentalAssetServiceResponse(deletedAsset, treasury)
  }
}
