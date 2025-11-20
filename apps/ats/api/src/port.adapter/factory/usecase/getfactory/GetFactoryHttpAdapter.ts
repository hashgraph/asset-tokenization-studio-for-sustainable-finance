// SPDX-License-Identifier: Apache-2.0

import { Get, Param } from "@nestjs/common"
import { type QueryBus, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetFactoryPort } from "./GetFactoryPort"
import { GetFactoryResponse } from "@port/factory/usecase/getfactory/model/GetFactoryResponse"
import { GetFactoryQuery } from "@app/factory/getfactory/query/GetFactoryQuery"

@RestController("factory")
export class GetFactoryHttpAdapter implements GetFactoryPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":factoryId")
  async getFactory(@Param("factoryId") factoryId: string): Promise<GetFactoryResponse> {
    return await this.queryBus.execute(new GetFactoryQuery(factoryId))
  }
}
