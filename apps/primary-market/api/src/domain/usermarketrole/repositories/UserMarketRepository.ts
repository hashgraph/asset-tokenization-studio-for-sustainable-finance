// SPDX-License-Identifier: Apache-2.0

import { UserMarketRole } from "../model/UserMarketRole"

export interface UserMarketRoleRepository {
  save(userMarketRole: UserMarketRole): Promise<UserMarketRole>
  findByUserRoleAndMarket(userId: string, roleId: string, marketId: string): Promise<UserMarketRole | null>
}
