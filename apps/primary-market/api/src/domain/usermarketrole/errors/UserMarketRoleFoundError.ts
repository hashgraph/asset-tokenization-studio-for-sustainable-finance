// SPDX-License-Identifier: Apache-2.0

import { EntityFoundError } from "@hashgraph/green-bonds-shared-core"

export class UserMarketRoleFoundError extends EntityFoundError {
  static roleAlreadyGranted(accountId: string, roleHex: string, marketContractId: string): UserMarketRoleFoundError {
    return new UserMarketRoleFoundError(`User ${accountId} already has role ${roleHex} in market ${marketContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
