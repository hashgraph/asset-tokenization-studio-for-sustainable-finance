import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"
import { AddEnvironmentalAssetServiceResponse } from "@domain/environmentalasset/services/AddEnvironmentalAssetServiceResponse"

@Singleton()
export class AddEnvironmentalAssetDomainService {
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    private readonly checkEnvironmentalAssetNotExists: CheckEnvironmentalAssetNotExistsDomainService,
  ) {}

  async execute(operatorAddress: string, erc721: string): Promise<AddEnvironmentalAssetServiceResponse> {
    const treasury = await this.treasuryRepository.findByContractAddress(operatorAddress)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([operatorAddress])
    }

    await this.checkEnvironmentalAssetNotExists.execute(erc721, treasury.id)

    const environmentalAsset = new EnvironmentalAsset()
    environmentalAsset.assetId = erc721
    environmentalAsset.treasuryId = treasury.id

    await this.environmentalAssetRepository.save(environmentalAsset)

    return new AddEnvironmentalAssetServiceResponse(environmentalAsset, treasury)
  }
}
