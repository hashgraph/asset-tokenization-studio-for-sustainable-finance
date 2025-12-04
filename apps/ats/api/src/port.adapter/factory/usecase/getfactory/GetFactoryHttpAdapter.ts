// SPDX-License-Identifier: Apache-2.0

import { Get, Param } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { type QueryBus, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetFactoryPort } from "./GetFactoryPort"
import { GetFactoryResponse } from "@port/factory/usecase/getfactory/model/GetFactoryResponse"
import { GetFactoryQuery } from "@app/factory/getfactory/query/GetFactoryQuery"

@ApiTags("ATS")
@RestController("factory")
export class GetFactoryHttpAdapter implements GetFactoryPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get factory details by contract ID" })
  @ApiResponse({ status: 200, type: GetFactoryResponse })
  @Get(":factoryContractId")
  async getFactory(@Param("factoryContractId") factoryContractId: string): Promise<GetFactoryResponse> {
    return await this.queryBus.execute(new GetFactoryQuery(factoryContractId))
  }
}
