// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateClearingHoldTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expirationTimestamp: Date

  @IsNotEmpty()
  @IsString()
  escrowAddress: string

  @IsOptional()
  @IsString()
  data?: string
}
