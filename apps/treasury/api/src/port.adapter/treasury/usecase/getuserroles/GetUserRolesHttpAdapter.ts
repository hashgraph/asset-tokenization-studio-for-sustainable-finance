// SPDX-License-Identifier: Apache-2.0

import { Get, Param, Query } from "@nestjs/common"
import { GetUserRolesPort } from "./GetUserRolesPort"
import { GetUserRoleResponse } from "@port/treasury/usecase/getuserroles/model/GetUserRoleResponse"
import {
  type QueryBus,
  GetUserRolesQuery,
  PageResponse,
  QueryPageRequest,
  RestController,
  Inject,
} from "@hashgraph/green-bonds-shared-core"

@RestController("treasuries")
export class GetUserRolesHttpAdapter implements GetUserRolesPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId/users/:userAccountId/roles")
  async getUserRoles(
    @Param("treasuryContractId") treasuryContractId: string,
    @Param("userAccountId") userAccountId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetUserRoleResponse>> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    const query = new GetUserRolesQuery(userAccountId, treasuryContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
