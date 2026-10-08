// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetUserRolesPort } from "./GetUserRolesPort"
import { GetUserRoleResponse } from "@port/factory/usecase/getuserroles/model/GetUserRoleResponse"
import {
  type QueryBus,
  GetUserRolesQuery,
  PageResponse,
  RestController,
  Inject,
  PageOptionsRequest,
} from "@hashgraph/green-bonds-shared-core"

@ApiTags("ATS")
@RestController("factories")
export class GetUserRolesHttpAdapter implements GetUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get roles for a specific user in factory" })
  @ApiResponse({ status: 200, type: GetUserRoleResponse, isArray: true })
  @Get(":factoryContractId/users/:userAccountId/roles")
  async getUserRoles(
    @Param("factoryContractId") factoryContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, factoryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
