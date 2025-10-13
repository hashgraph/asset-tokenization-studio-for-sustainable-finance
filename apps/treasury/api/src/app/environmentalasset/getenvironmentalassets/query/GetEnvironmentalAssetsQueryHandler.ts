// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { QueryHandler } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { GetEnvironmentalAssetsQuery } from "./GetEnvironmentalAssetsQuery"
import { EnvironmentalAssetQueryResponse } from "./EnvironmentalAssetQueryResponse"

@Singleton()
@Handler(GetEnvironmentalAssetsQuery)
export class GetEnvironmentalAssetsQueryHandler
  implements QueryHandler<GetEnvironmentalAssetsQuery, EnvironmentalAssetQueryResponse>
{
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
  ) {}

  @Validate()
  async execute(query: GetEnvironmentalAssetsQuery): Promise<EnvironmentalAssetQueryResponse> {
    const treasury = await this.treasuryRepository.findByContractId(query.treasuryContractId)
    if (!treasury) {
      throw TreasuryNotFoundError.contractIdsError([query.treasuryContractId])
    }

    const domainPage = await this.environmentalAssetRepository.findAllByTreasuryId(
      treasury.id,
      query.pageOptions.toPageOptions(),
    )
    return EnvironmentalAssetQueryResponse.fromDomainPage(domainPage)
  }
}
