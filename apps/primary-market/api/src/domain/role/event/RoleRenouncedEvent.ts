// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class RoleRenouncedEvent extends Event {
  constructor(
    readonly accountId: string,
    readonly roleHex: string,
    readonly marketContractId: string,
  ) {
    super()
  }
}
