// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class RoleGrantedEvent extends Event {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly roleHex: string,
    public readonly marketId: string,
  ) {
    super()
  }
}
