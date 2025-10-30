// SPDX-License-Identifier: Apache-2.0

import { Command } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString, IsNumber } from "class-validator"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"
import { DistributionHolder } from "@domain/distribution/model/DistributionHolder"

export class AddDistributionHolderCommand extends Command<DistributionHolder> {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(DistributionHolderStatus)
  status: DistributionHolderStatus

  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  constructor(holderAccountId: string, status: DistributionHolderStatus, amount: string, distributionId: number) {
    super()
    this.holderAccountId = holderAccountId
    this.status = status
    this.amount = amount
    this.distributionId = distributionId
  }
}
