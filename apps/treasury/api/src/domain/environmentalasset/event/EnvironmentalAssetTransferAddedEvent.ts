// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTransferAddedEvent extends Event {
  constructor(
    readonly environmentalAssetId: string,
    readonly tokenId: number,
    readonly account: string,
    readonly type: string,
  ) {
    super()
  }
}
