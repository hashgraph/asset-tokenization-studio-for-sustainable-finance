// SPDX-License-Identifier: Apache-2.0

import {
  Inject,
  RestController,
  PageOptionsRequest,
  GetUserRolesQuery,
  PageResponse,
  type QueryBus,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetPrimaryMarketFactoryUserRolesPort } from "./GetPrimaryMarketFactoryUserRolesPort"
import { GetUserRoleResponse } from "./model/GetUserRoleResponse"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketFactoryUserRolesHttpAdapter implements GetPrimaryMarketFactoryUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all roles for a specific user in a factory" })
  @ApiPaginatedResponse(GetUserRoleResponse)
  @Get("factories/:factoryContractId/users/:userAccountId/roles")
  async getPrimaryMarketFactoryUserRoles(
    @Param("factoryContractId") factoryContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, factoryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
