// SPDX-License-Identifier: Apache-2.0

import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetRoleMemberResponse } from "@port/bond/usecase/getrolemembers/model/GetRoleMemberResponse"

export interface GetRoleMembersPort {
  getRoleMembers(
    bondContractId: string,
    roleId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>>
}
