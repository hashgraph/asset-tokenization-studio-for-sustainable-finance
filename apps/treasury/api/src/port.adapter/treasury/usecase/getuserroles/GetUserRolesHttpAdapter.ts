// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { type QueryBus, RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import { GetUserRolesPort } from "./GetUserRolesPort"
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetUserRolesQuery } from "@app/treasury/getuserroles/query/GetUserRolesQuery"
import { GetUserRoleResponse } from "@port/treasury/usecase/getuserroles/model/GetUserRoleResponse"

@RestController("treasuries")
export class GetUserRolesHttpAdapter implements GetUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get()
  async getUserRoles(
    @Param("userAccountId") userAccountId: string,
    @Param("treasuryContractId") treasuryContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
