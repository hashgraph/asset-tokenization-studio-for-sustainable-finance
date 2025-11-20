// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"

export class UnpauseFactoryCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  factoryId: string

  constructor(factoryId: string) {
    super()
    this.factoryId = factoryId
  }
}
