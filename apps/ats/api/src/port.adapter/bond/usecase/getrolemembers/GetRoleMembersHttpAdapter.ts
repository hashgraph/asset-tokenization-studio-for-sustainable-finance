// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { GetRoleMemberResponse } from "@port/bond/usecase/getrolemembers/model/GetRoleMemberResponse"
import {
  type QueryBus,
  GetRoleMembersQuery,
  PageResponse,
  QueryPageRequest,
  RestController,
  Inject,
} from "@hashgraph/green-bonds-shared-core"

@RestController("bonds")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("bondContractId") bondContractId: string,
    @Param("roleId") roleId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, bondContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
