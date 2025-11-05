// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondControlListMemberDeletedEvent extends Event {
  constructor(
    public readonly contractId: string,
    public readonly holderId: string,
  ) {
    super()
  }
}
