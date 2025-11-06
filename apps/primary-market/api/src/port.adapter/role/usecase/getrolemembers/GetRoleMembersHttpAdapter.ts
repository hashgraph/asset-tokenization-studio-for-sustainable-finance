// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { PageResponse, QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { RoleMemberResponse } from "./RoleMemberResponse"
import { GetRoleMembersQuery } from "@app/role/getrolemembers/query/GetRoleMembersQuery"

@RestController("primary-markets")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":marketContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("marketContractId") marketContractId: string,
    @Param("roleId") roleId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<RoleMemberResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(marketContractId, roleId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
