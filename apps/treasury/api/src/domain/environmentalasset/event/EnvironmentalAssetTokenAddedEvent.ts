// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTokenAddedEvent extends Event {
  constructor(
    public readonly environmentalAssetId: string,
    public readonly serialNumber: string,
  ) {
    super()
  }
}
