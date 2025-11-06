// SPDX-License-Identifier: Apache-2.0

import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { UserMarketRole } from "../model/UserMarketRole"

export interface UserMarketRoleRepository {
  save(userMarketRole: UserMarketRole): Promise<UserMarketRole>
  findByUserRoleAndMarket(userId: string, roleId: string, marketId: string): Promise<UserMarketRole | null>
  findByMarketIdAndRoleId(marketId: string, roleId: string, pageOptions: PageOptions): Promise<Page<UserMarketRole>>
}
