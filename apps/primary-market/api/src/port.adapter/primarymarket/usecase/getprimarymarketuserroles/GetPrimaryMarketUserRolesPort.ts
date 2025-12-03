// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetPrimaryMarketUserRoleResponse } from "./model/GetPrimaryMarketUserRoleResponse"

export interface GetPrimaryMarketUserRolesPort {
  getPrimaryMarketUserRoles(
    marketContractId: string,
    userAccountId: string,
    pageOptionsRequest: any,
  ): Promise<PageResponse<GetPrimaryMarketUserRoleResponse>>
}
