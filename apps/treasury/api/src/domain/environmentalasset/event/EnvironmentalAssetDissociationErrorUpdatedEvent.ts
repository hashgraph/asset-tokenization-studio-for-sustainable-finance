// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetDissociationErrorUpdatedEvent extends Event {
  readonly treasuryContractId: string
  readonly environmentalAssetContractId: string

  constructor(treasuryContractId: string, environmentalAssetContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.environmentalAssetContractId = environmentalAssetContractId
  }
}
