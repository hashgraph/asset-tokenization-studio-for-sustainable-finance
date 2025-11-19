// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetUserRolesPort } from "./GetUserRolesPort"
import { GetUserRoleResponse } from "@port/treasury/usecase/getuserroles/model/GetUserRoleResponse"
import {
  type QueryBus,
  GetUserRolesQuery,
  PageResponse,
  PageOptionsRequest,
  RestController,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ApiPaginatedResponse } from "@hashgraph/green-bonds-shared-core"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetUserRolesHttpAdapter implements GetUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns the list of roles for a specific user" })
  @ApiPaginatedResponse(GetUserRoleResponse)
  @Get(":treasuryId/users/:userId/roles")
  async getUserRoles(
    @Param("treasuryId") treasuryContractId: string,
    @Param("userId") userAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
