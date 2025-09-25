// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EventFiltersAdded extends Event {
  constructor(
    readonly contractAddress: string,
    readonly eventSignatures: string[],
  ) {
    super()
  }
}
