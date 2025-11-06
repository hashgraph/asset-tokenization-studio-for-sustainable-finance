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
    const { marketContractId, pageOptions } = query

    const market = await this.checkPrimaryMarketExistsDomainService.execute(marketContractId)

    const bondsPage = await this.offeringRepository.findUniqueBondContractIdsByMarketId(
      market.id,
      pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(bondsPage, (bondContractId: string) => ({
      bondContractId: bondContractId,
    }))
  }
}
