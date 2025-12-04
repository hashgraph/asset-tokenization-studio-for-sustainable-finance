// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class RemoveBondDocumentCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  name: string

  constructor(contractId: string, name: string) {
    super()
    this.contractId = contractId
    this.name = name
  }
}
