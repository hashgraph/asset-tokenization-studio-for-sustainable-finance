import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { RemoveEnvironmentalAssetDomainServiceResponse } from "@domain/environmentalasset/services/model/RemoveEnvironmentalAssetDomainServiceResponse"

@Singleton()
export class RemoveEnvironmentalAssetDomainService {
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
  ) {}

  async execute(
    treasuryContractId: string,
    assetContractId: string,
    dissociationError: number,
  ): Promise<RemoveEnvironmentalAssetDomainServiceResponse> {
    const treasury = await this.treasuryRepository.findByContractId(treasuryContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.contractIdsError([treasuryContractId])
    }

    let environmentalAsset = await this.checkEnvironmentalAssetExists.execute(assetContractId, treasury.id)
    environmentalAsset.removalDate = new Date()
    environmentalAsset.dissociationError = dissociationError || undefined

    environmentalAsset = await this.environmentalAssetRepository.save(environmentalAsset)

    return new RemoveEnvironmentalAssetDomainServiceResponse(environmentalAsset, treasury)
  }
}
