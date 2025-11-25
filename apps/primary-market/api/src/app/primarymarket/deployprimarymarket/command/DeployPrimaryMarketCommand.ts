// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsString, IsNotEmpty } from "class-validator"

export class DeployPrimaryMarketCommand extends Command<void> {
  @IsString()
  @IsNotEmpty()
  contractId: string

  constructor(contractId: string) {
    super()
    this.contractId = contractId
  }
}
