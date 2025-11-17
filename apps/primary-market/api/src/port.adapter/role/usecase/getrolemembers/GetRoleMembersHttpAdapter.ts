// SPDX-License-Identifier: Apache-2.0

import {
  Inject,
  RestController,
  PageOptionsRequest,
  GetRoleMembersQuery,
  PageResponse,
  type QueryBus,
} from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { RoleMemberResponse } from "./RoleMemberResponse"

@RestController("primary-markets")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":marketContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("marketContractId") marketContractId: string,
    @Param("roleId") roleId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<RoleMemberResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, marketContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
