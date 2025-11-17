// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class UnpausePrimaryMarketCommand extends Command<void> {
  @IsNotEmpty()
  marketContractId: string

  constructor(marketContractId: string) {
    super()
    this.marketContractId = marketContractId
  }
}
