// SPDX-License-Identifier: Apache-2.0

import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketQuery } from "./GetPrimaryMarketQuery"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { PrimaryMarketQueryResponse } from "@app/primarymarket/shared/model/PrimaryMarketQueryResponse"

@Singleton()
@Handler(GetPrimaryMarketQuery)
export class GetPrimaryMarketQueryHandler implements QueryHandler<GetPrimaryMarketQuery, PrimaryMarketQueryResponse> {
  constructor(private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService) {}

  @Validate()
  async execute(query: GetPrimaryMarketQuery): Promise<PrimaryMarketQueryResponse> {
    const { marketId } = query
    const primaryMarket = await this.checkPrimaryMarketExistsDomainService.execute(marketId)

    return Object.assign(new PrimaryMarketQueryResponse(), {
      id: primaryMarket.id,
      createdAt: primaryMarket.createdAt,
      contractId: primaryMarket.contractId,
      isPaused: primaryMarket.isPaused,
    })
  }
}
