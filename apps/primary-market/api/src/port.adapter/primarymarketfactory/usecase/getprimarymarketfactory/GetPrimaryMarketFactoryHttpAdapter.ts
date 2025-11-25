// SPDX-License-Identifier: Apache-2.0

import { Get, Param } from "@nestjs/common"
import { type QueryBus, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketFactoryPort } from "./GetPrimaryMarketFactoryPort"
import { GetPrimaryMarketFactoryResponse } from "./model/GetPrimaryMarketFactoryResponse"
import { GetPrimaryMarketFactoryQuery } from "@app/primarymarketfactory/getprimarymarketfactory/query/GetPrimaryMarketFactoryQuery"

@RestController("primary-markets")
export class GetPrimaryMarketFactoryHttpAdapter implements GetPrimaryMarketFactoryPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("factories/:factoryContractId")
  async getPrimaryMarketFactory(
    @Param("factoryContractId") factoryContractId: string,
  ): Promise<GetPrimaryMarketFactoryResponse> {
    const query = new GetPrimaryMarketFactoryQuery(factoryContractId)
    return await this.queryBus.execute(query)
  }
}
