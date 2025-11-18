// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsDateString } from "class-validator"

export class BuildCreateBondHoldTransactionRequest extends BaseBuildTransactionRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsDateString()
  @IsNotEmpty()
  expirationTimestamp: Date

  @IsString()
  @IsNotEmpty()
  escrowAccountId: string

  @IsString()
  @IsOptional()
  toAccountId?: string

  @IsString()
  @IsOptional()
  data?: string
}
