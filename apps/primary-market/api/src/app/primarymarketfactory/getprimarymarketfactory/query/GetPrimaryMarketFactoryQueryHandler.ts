// SPDX-License-Identifier: Apache-2.0

import { QueryHandler, Handler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckPrimaryMarketFactoryExistsDomainService } from "@domain/primarymarketfactory/services/CheckPrimaryMarketFactoryExistsDomainService"
import { GetPrimaryMarketFactoryQuery } from "./GetPrimaryMarketFactoryQuery"
import { PrimaryMarketFactoryQueryResponse } from "./PrimaryMarketFactoryQueryResponse"

@Singleton()
@Handler(GetPrimaryMarketFactoryQuery)
export class GetPrimaryMarketFactoryQueryHandler
  implements QueryHandler<GetPrimaryMarketFactoryQuery, PrimaryMarketFactoryQueryResponse>
{
  constructor(
    private readonly checkPrimaryMarketFactoryExistsDomainService: CheckPrimaryMarketFactoryExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetPrimaryMarketFactoryQuery): Promise<PrimaryMarketFactoryQueryResponse> {
    const { factoryContractId } = query
    const factory = await this.checkPrimaryMarketFactoryExistsDomainService.execute(factoryContractId)

    return Object.assign(new PrimaryMarketFactoryQueryResponse(), {
      factoryContractId: factory.contractId,
      isPaused: factory.isPaused,
      createdAt: factory.createdAt,
    })
  }
}
