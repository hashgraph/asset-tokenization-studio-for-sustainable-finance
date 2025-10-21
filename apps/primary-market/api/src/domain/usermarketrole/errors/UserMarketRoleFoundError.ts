// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class UserMarketRoleFoundError extends EntityFoundError {
  static roleAlreadyGranted(accountId: string, roleHex: string, marketId: string): UserMarketRoleFoundError {
    return new UserMarketRoleFoundError(`User ${accountId} already has role ${roleHex} in market ${marketId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
