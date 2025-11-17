// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "@port/treasury/usecase/getuserroles/model/GetUserRoleResponse"

export interface GetUserRolesPort {
  getUserRoles(
    userAccountId: string,
    contractId: string,
    queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
