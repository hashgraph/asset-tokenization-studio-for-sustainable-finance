// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class SetBondDocumentCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  uri: string

  @IsNotEmpty()
  @IsString()
  hash: string

  constructor(bondContractId: string, name: string, uri: string, hash: string) {
    super()
    this.bondContractId = bondContractId
    this.name = name
    this.uri = uri
    this.hash = hash
  }
}
