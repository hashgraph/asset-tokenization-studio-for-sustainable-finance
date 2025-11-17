// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "@port/bond/usecase/getuserroles/model/GetUserRoleResponse"

export interface GetUserRolesPort {
  getUserRoles(
    bondContractId: string,
    userAccountId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
