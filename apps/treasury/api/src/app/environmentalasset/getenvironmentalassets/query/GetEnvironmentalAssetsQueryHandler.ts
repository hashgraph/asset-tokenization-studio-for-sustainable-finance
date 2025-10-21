// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { GetEnvironmentalAssetsQuery } from "./GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetQueryResponse } from "./EnvironmentalAssetQueryResponse"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetEnvironmentalAssetsQuery)
export class GetEnvironmentalAssetsQueryHandler
  implements QueryHandler<GetEnvironmentalAssetsQuery, QueryPageResponse<EnvironmentalAssetQueryResponse>>
{
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetEnvironmentalAssetsQuery): Promise<QueryPageResponse<EnvironmentalAssetQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)
    const page = await this.environmentalAssetRepository.findAllByTreasuryId(
      treasury.id,
      query.pageOptions.toPageOptions(),
    )
    return QueryPageResponse.fromPage(page, (environmentalAsset: EnvironmentalAsset) => ({
      contractId: environmentalAsset.contractId,
      additionDate: environmentalAsset.createdAt,
      removalDate: environmentalAsset.removalDate,
    }))
  }
}
