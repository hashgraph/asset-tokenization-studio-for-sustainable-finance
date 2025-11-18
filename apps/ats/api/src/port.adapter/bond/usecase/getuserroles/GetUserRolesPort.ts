// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "@port/bond/usecase/getuserroles/model/GetUserRoleResponse"

export interface GetUserRolesPort {
  getUserRoles(
    bondContractId: string,
    userAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
