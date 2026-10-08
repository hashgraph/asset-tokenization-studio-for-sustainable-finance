// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumberString, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetBondCapCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsNumberString()
  newMaxSupply: string

  constructor(bondContractId: string, newMaxSupply: string) {
    super()
    this.bondContractId = bondContractId
    this.newMaxSupply = newMaxSupply
  }
}
