// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString, NotEquals, IsOptional } from "class-validator"
import { RedemptionHolderStatus } from "./RedemptionHolderStatus"

export class RedemptionHolder extends BaseEntity {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(RedemptionHolderStatus)
  status: RedemptionHolderStatus

  @IsOptional()
  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount?: string

  @IsNotEmpty()
  treasuryId: string

  @IsNotEmpty()
  paymentTokenId: string
}
