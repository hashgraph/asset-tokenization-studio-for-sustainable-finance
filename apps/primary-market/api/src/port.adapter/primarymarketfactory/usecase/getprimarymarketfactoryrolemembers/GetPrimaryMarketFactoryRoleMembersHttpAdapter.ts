// SPDX-License-Identifier: Apache-2.0

import {
  Inject,
  RestController,
  PageOptionsRequest,
  GetRoleMembersQuery,
  PageResponse,
  type QueryBus,
  ApiPaginatedResponse,
} from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { GetPrimaryMarketFactoryRoleMembersPort } from "./GetPrimaryMarketFactoryRoleMembersPort"
import { GetRoleMemberResponse } from "./model/GetRoleMemberResponse"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class GetPrimaryMarketFactoryRoleMembersHttpAdapter implements GetPrimaryMarketFactoryRoleMembersPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Gets all members of a specific role for a factory" })
  @ApiPaginatedResponse(GetRoleMemberResponse)
  @Get("factories/:factoryContractId/roles/:roleId/members")
  async getPrimaryMarketFactoryRoleMembers(
    @Param("factoryContractId") factoryContractId: string,
    @Param("roleId") roleId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetRoleMembersQuery(roleId, factoryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
