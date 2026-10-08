// SPDX-License-Identifier: Apache-2.0

import { PageOptionsRequest, PageResponse } from "@hashgraph/green-bonds-shared-core"
import { GetUserRoleResponse } from "./model/GetUserRoleResponse"

export interface GetPrimaryMarketFactoryUserRolesPort {
  getPrimaryMarketFactoryUserRoles(
    factoryContractId: string,
    userAccountId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<GetUserRoleResponse>>
}
