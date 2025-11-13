// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { GetRoleMemberResponse } from "@port/treasury/usecase/getrolemembers/model/GetRoleMemberResponse"
import {
  type QueryBus,
  GetRoleMembersQuery,
  PageResponse,
  QueryPageRequest,
  RestController,
  Inject,
} from "@hashgraph/green-bonds-shared-core"

@RestController("treasuries")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("roleId") roleId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
