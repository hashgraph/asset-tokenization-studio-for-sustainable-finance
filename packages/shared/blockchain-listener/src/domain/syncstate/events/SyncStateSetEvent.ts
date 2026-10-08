// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class SyncStateSetEvent extends Event {
  constructor(
    readonly lastBlockNumber: number,
    readonly status: string,
  ) {
    super()
  }
}
