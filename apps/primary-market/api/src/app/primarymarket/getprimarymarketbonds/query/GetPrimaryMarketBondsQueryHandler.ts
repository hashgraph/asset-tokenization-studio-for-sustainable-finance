// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketBondsQuery } from "./GetPrimaryMarketBondsQuery"
import { PrimaryMarketBondQueryResponse } from "./PrimaryMarketBondQueryResponse"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { OfferingRepository } from "@domain/offering/repositories/OfferingRepository"

@Singleton()
@Handler(GetPrimaryMarketBondsQuery)
export class GetPrimaryMarketBondsQueryHandler
  implements QueryHandler<GetPrimaryMarketBondsQuery, QueryPageResponse<PrimaryMarketBondQueryResponse>>
{
  constructor(
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
    @Inject() private readonly offeringRepository: OfferingRepository,
  ) {}

  @Validate()
  async execute(query: GetPrimaryMarketBondsQuery): Promise<QueryPageResponse<PrimaryMarketBondQueryResponse>> {
    const { marketId, pageOptions } = query

    await this.checkPrimaryMarketExistsDomainService.execute(marketId)

    const bondsPage = await this.offeringRepository.findUniqueBondIdsByMarketId(marketId, pageOptions.toPageOptions())

    return QueryPageResponse.fromPage(bondsPage, (bondId: string) => ({
      bondId: bondId,
    }))
  }
}
