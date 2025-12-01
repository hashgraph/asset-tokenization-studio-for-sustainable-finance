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
import { GetPrimaryMarketUserRolesPort } from "./GetPrimaryMarketUserRolesPort"
import { GetPrimaryMarketUserRoleResponse } from "./model/GetPrimaryMarketUserRoleResponse"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketUserRolesHttpAdapter implements GetPrimaryMarketUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all roles for a specific user in a primary market" })
  @ApiPaginatedResponse(GetPrimaryMarketUserRoleResponse)
  @Get(":marketContractId/users/:userAccountId/roles")
  async getPrimaryMarketUserRoles(
    @Param("marketContractId") marketContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetPrimaryMarketUserRoleResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, marketContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
