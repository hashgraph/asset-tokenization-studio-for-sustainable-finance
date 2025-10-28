// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetBondDocumentCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  uri: string

  @IsNotEmpty()
  @IsString()
  hash: string

  constructor(contractId: string, name: string, uri: string, hash: string) {
    super()
    this.contractId = contractId
    this.name = name
    this.uri = uri
    this.hash = hash
  }
}
