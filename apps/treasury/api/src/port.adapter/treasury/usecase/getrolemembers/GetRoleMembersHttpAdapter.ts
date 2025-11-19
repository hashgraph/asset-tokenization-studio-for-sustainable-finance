// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { GetRoleMemberResponse } from "@port/treasury/usecase/getrolemembers/model/GetRoleMemberResponse"
import {
  type QueryBus,
  GetRoleMembersQuery,
  PageResponse,
  PageOptionsRequest,
  RestController,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { ApiPaginatedResponse } from "@hashgraph/green-bonds-shared-core"

@ApiTags("Treasury")
@RestController("treasuries")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Returns the list of account ids having a specific role" })
  @ApiPaginatedResponse(GetRoleMemberResponse)
  @Get(":treasuryId/roles/:roleId/members")
  async getRoleMembers(
    @Param("treasuryId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
