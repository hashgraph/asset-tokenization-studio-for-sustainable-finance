// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetRoleMemberResponse } from "./model/GetRoleMemberResponse"

export interface GetPrimaryMarketFactoryRoleMembersPort {
  getPrimaryMarketFactoryRoleMembers(
    factoryContractId: string,
    roleId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetRoleMemberResponse>>
}
