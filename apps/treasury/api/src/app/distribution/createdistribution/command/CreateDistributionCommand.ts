// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateDistributionCommand extends Command<void> {
  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  @IsNotEmpty()
  treasuryId: string

  constructor(distributionId: number, treasuryId: string) {
    super()
    this.distributionId = distributionId
    this.treasuryId = treasuryId
  }
}
