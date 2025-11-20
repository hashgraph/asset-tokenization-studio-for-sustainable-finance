// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "@port/factory/usecase/getuserroles/model/GetUserRoleResponse"

export interface GetUserRolesPort {
  getUserRoles(
    factoryId: string,
    userId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
