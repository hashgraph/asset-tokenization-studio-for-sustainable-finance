// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "@port/treasury/usecase/getuserroles/model/GetUserRoleResponse"

export interface GetUserRolesPort {
  getUserRoles(
    userAccountId: string,
    contractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
