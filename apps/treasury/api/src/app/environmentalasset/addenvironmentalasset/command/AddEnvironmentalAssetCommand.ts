// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class AddEnvironmentalAssetCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  operator: string

  @IsString()
  @IsNotEmpty()
  erc721: string

  constructor(operator: string, erc721: string) {
    super()
    this.operator = operator
    this.erc721 = erc721
  }
}
