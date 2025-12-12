// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveBondDocumentCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  name: string

  constructor(bondContractId: string, name: string) {
    super()
    this.bondContractId = bondContractId
    this.name = name
  }
}
