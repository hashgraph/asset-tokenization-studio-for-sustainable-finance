// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { GetRoleMemberResponse } from "@port/bond/usecase/getrolemembers/model/GetRoleMemberResponse"
import {
  type QueryBus,
  GetRoleMembersQuery,
  PageResponse,
  RestController,
  Inject,
  PageOptionsRequest,
} from "@hashgraph/green-bonds-shared-core"

@ApiTags("ATS")
@RestController("bonds")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get members of a specific role" })
  @ApiResponse({ status: 200, type: GetRoleMemberResponse, isArray: true })
  @Get(":bondContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("bondContractId") bondContractId: string,
    @Param("roleId") roleId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, bondContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
