// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetUserRolesPort } from "./GetUserRolesPort"
import { GetUserRoleResponse } from "@port/bond/usecase/getuserroles/model/GetUserRoleResponse"
import {
  type QueryBus,
  GetUserRolesQuery,
  PageResponse,
  RestController,
  Inject,
  PageOptionsRequest,
} from "@hashgraph/green-bonds-shared-core"

@RestController("bonds")
export class GetUserRolesHttpAdapter implements GetUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":bondContractId/users/:userAccountId/roles")
  async getUserRoles(
    @Param("bondContractId") bondContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, bondContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
