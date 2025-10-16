// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { QueryHandler, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetEnvironmentalAssetHoldingsQuery } from "./GetEnvironmentalAssetHoldingsQuery"
import { EnvironmentalAssetHoldingsQueryResponse } from "./EnvironmentalAssetHoldingsQueryResponse"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"

@Singleton()
@Handler(GetEnvironmentalAssetHoldingsQuery)
export class GetEnvironmentalAssetHoldingsQueryHandler
  implements
    QueryHandler<GetEnvironmentalAssetHoldingsQuery, QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>>
{
  constructor(
    @Inject("EnvironmentalAssetTokenRepository")
    private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkTreasuryExists: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(
    query: GetEnvironmentalAssetHoldingsQuery,
  ): Promise<QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>> {
    const treasury = await this.checkTreasuryExists.execute(query.treasuryContractId)
    const environmentalAsset = await this.checkEnvironmentalAssetExists.execute(query.assetContractId, treasury.id)

    const page = await this.environmentalAssetTokenRepository.findAllByEnvironmentalAssetId(
      environmentalAsset.id,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (token: EnvironmentalAssetToken) => ({
      tokenId: token.tokenId,
      additionDate: token.createdAt.toISOString(),
    }))
  }
}
