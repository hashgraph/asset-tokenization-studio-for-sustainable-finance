// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"

export class CreateBondHoldTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  expirationTimestamp: Date

  @IsString()
  @IsNotEmpty()
  escrowAccountId: string

  @IsString()
  @IsOptional()
  data?: string
}
