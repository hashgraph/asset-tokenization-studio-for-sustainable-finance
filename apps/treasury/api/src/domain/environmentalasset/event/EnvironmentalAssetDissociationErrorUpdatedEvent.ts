// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetDissociationErrorUpdatedEvent extends Event {
  readonly treasuryId: string
  readonly environmentalAssetId: string

  constructor(treasuryId: string, environmentalAssetId: string) {
    super()
    this.treasuryId = treasuryId
    this.environmentalAssetId = environmentalAssetId
  }
}
