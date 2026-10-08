// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional } from "class-validator"
import { DistributionHolderStatus } from "./DistributionHolderStatus"

export class DistributionHolder extends BaseEntity {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(DistributionHolderStatus)
  status: DistributionHolderStatus

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  amount?: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number

  @IsNotEmpty()
  paymentTokenId: string

  success(paymentTokenId: string, amount: string): void {
    this.paymentTokenId = paymentTokenId
    this.amount = amount
    this.status = DistributionHolderStatus.SUCCESS
  }
}
