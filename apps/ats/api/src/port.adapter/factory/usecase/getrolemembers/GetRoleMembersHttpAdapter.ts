// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetRoleMembersPort } from "./GetRoleMembersPort"
import { GetRoleMemberResponse } from "@port/factory/usecase/getrolemembers/model/GetRoleMemberResponse"
import {
  type QueryBus,
  GetRoleMembersQuery,
  PageResponse,
  RestController,
  Inject,
  PageOptionsRequest,
} from "@hashgraph/green-bonds-shared-core"

@RestController("factories")
export class GetRoleMembersHttpAdapter implements GetRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":factoryContractId/roles/:roleId/members")
  async getRoleMembers(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, factoryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
