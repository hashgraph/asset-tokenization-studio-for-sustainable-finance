import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"
import { AddEnvironmentalAssetDomainServiceResponse } from "@domain/environmentalasset/services/model/AddEnvironmentalAssetDomainServiceResponse"

@Singleton()
export class AddEnvironmentalAssetDomainService {
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    private readonly checkEnvironmentalAssetNotExists: CheckEnvironmentalAssetNotExistsDomainService,
  ) {}

  async execute(
    treasuryContractId: string,
    assetContractId: string,
  ): Promise<AddEnvironmentalAssetDomainServiceResponse> {
    const treasury = await this.treasuryRepository.findByContractId(treasuryContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.contractIdsError([treasuryContractId])
    }

    await this.checkEnvironmentalAssetNotExists.execute(assetContractId, treasury.id)

    const environmentalAsset = new EnvironmentalAsset()
    environmentalAsset.contractId = assetContractId
    environmentalAsset.treasuryId = treasury.id

    await this.environmentalAssetRepository.save(environmentalAsset)

    return new AddEnvironmentalAssetDomainServiceResponse(environmentalAsset, treasury)
  }
}
