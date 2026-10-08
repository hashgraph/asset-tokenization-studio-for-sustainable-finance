// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenRemovedEvent extends Event {
  constructor(
    readonly environmentalAssetId: string,
    readonly tokenId: number,
  ) {
    super()
  }
}
