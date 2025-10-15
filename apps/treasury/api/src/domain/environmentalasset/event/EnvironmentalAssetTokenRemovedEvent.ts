// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenRemovedEvent extends Event {
  constructor(
    public readonly environmentalAssetId: string,
    public readonly serialNumber: string,
    public readonly fromAccountId: string,
  ) {
    super()
  }
}
