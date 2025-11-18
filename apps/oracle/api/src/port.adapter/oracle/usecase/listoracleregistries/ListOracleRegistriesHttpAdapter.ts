// SPDX-License-Identifier: Apache-2.0
import { Inject, RestController, PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { ListOracleRegistriesQuery } from "@app/oracle/listoracleregistries/query/ListOracleRegistriesQuery"
import { OracleRegistryResponse } from "./model/OracleRegistryResponse"

@RestController("oracle/registries")
export class ListOracleRegistriesHttpAdapter {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async listOracleRegistries(
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<OracleRegistryResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new ListOracleRegistriesQuery(queryPageOptions))
  }
}
