// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class CreateTreasuryCommand extends Command<void> {
  @IsNotEmpty()
  treasuryContractId: string

  @IsNotEmpty()
  bondContractId: string

  constructor(treasuryContractId: string, bondContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.bondContractId = bondContractId
  }
}
