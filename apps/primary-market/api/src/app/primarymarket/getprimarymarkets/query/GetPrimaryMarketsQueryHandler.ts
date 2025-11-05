// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketsQuery } from "./GetPrimaryMarketsQuery"
import { PrimaryMarketQueryResponse } from "@app/primarymarket/shared/model/PrimaryMarketQueryResponse"
import type { PrimaryMarketRepository } from "@domain/primarymarket/repositories/PrimaryMarketRepository"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"

@Singleton()
@Handler(GetPrimaryMarketsQuery)
export class GetPrimaryMarketsQueryHandler
  implements QueryHandler<GetPrimaryMarketsQuery, QueryPageResponse<PrimaryMarketQueryResponse>>
{
  constructor(@Inject() private readonly primaryMarketRepository: PrimaryMarketRepository) {}

  @Validate()
  async execute(query: GetPrimaryMarketsQuery): Promise<QueryPageResponse<PrimaryMarketQueryResponse>> {
    const { pageOptions } = query
    const primaryMarketsPage = await this.primaryMarketRepository.findAll(pageOptions)

    return QueryPageResponse.fromPage(primaryMarketsPage, (primaryMarket: PrimaryMarket) => ({
      id: primaryMarket.id,
      createdAt: primaryMarket.createdAt,
      contractId: primaryMarket.contractId,
      isPaused: primaryMarket.isPaused,
    }))
  }
}
