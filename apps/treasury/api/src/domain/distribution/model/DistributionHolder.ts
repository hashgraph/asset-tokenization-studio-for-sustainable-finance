// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString, IsNumber } from "class-validator"
import { DistributionHolderStatus } from "./DistributionHolderStatus"

export class DistributionHolder extends BaseEntity {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(DistributionHolderStatus)
  status: DistributionHolderStatus

  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number
}
