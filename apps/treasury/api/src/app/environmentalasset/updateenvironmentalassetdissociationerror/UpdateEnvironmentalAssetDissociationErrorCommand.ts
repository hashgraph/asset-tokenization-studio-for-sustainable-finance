// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class UpdateEnvironmentalAssetDissociationErrorCommand extends Command<void> {
  @IsNotEmpty()
  treasuryContractId: string

  @IsNotEmpty()
  environmentalAssetContractId: string

  constructor(treasuryContractId: string, environmentalAssetContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.environmentalAssetContractId = environmentalAssetContractId
  }
}
