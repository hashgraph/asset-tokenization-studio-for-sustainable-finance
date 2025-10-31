// SPDX-License-Identifier: Apache-2.0
import { IsDefined, IsInt, IsNotEmpty, IsString, Min } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveEnvironmentalAssetCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  assetContractId: string

  @IsInt()
  @IsDefined()
  @Min(0)
  dissociationError: number

  constructor(treasuryContractId: string, assetContractId: string, dissociationError: number) {
    super()
    this.treasuryContractId = treasuryContractId
    this.assetContractId = assetContractId
    this.dissociationError = dissociationError
  }
}
