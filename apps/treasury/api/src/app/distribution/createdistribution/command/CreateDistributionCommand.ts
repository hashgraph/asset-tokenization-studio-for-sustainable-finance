// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"
import { Distribution } from "@domain/distribution/model/Distribution"

export class CreateDistributionCommand extends Command<Distribution> {
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
