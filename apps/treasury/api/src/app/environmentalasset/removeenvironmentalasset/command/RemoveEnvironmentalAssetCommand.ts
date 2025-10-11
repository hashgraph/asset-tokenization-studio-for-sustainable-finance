// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveEnvironmentalAssetCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  assetContractId: string

  constructor(treasuryContractId: string, assetContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.assetContractId = assetContractId
  }
}
