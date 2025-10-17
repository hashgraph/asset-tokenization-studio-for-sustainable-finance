// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveEnvironmentalAssetTokenCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  environmentalAssetContractId: string

  @IsNumber()
  tokenId: number

  constructor(environmentalAssetContractId: string, tokenId: number) {
    super()
    this.environmentalAssetContractId = environmentalAssetContractId
    this.tokenId = tokenId
  }
}
