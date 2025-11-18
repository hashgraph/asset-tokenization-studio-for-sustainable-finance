// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class DeleteOracleRegistryCommand extends Command<void> {
  @IsNotEmpty()
  @IsString()
  id: string

  constructor(id: string) {
    super()
    this.id = id
  }
}
