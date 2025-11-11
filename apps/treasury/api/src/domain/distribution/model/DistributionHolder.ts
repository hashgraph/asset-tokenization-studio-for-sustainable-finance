// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString, IsNumber, NotEquals, IsOptional } from "class-validator"
import { DistributionHolderStatus } from "./DistributionHolderStatus"

export class DistributionHolder extends BaseEntity {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(DistributionHolderStatus)
  status: DistributionHolderStatus

  @IsOptional()
  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount?: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  @IsNotEmpty()
  paymentTokenId: string
}
