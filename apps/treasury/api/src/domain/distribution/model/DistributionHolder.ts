// SPDX-License-Identifier: Apache-2.0

import { IsEnum, IsNotEmpty, IsNumberString, IsNumber, NotEquals } from "class-validator"

export enum DistributionHolderStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class DistributionHolder {
  @IsNotEmpty()
  holderAccountId: string

  @IsEnum(DistributionHolderStatus)
  status: DistributionHolderStatus

  @NotEquals("0")
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNumber()
  @IsNotEmpty()
  distributionId: number
}
