// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetRoleMemberResponse } from "@port/bond/usecase/getrolemembers/model/GetRoleMemberResponse"

export interface GetRoleMembersPort {
  getRoleMembers(
    bondContractId: string,
    roleId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>>
}
