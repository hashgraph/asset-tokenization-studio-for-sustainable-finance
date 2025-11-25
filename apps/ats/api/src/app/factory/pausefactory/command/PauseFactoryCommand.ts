// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class PauseFactoryCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  factoryContractId: string

  constructor(factoryContractId: string) {
    super()
    this.factoryContractId = factoryContractId
  }
}
