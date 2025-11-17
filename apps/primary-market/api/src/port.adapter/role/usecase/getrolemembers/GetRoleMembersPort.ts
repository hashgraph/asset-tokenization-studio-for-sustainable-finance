// SPDX-License-Identifier: Apache-2.0

import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { RoleMemberResponse } from "./RoleMemberResponse"

export interface GetRoleMembersPort {
  getRoleMembers(
    marketContractId: string,
    roleId: string,
    queryPageRequest: PageOptionsRequest,
  ): Promise<PageResponse<RoleMemberResponse>>
}
