// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class RoleRevokedEvent extends Event {
  constructor(
    readonly accountId: string,
    readonly roleId: string,
    readonly treasuryContractId: string,
  ) {
    super()
  }
}
