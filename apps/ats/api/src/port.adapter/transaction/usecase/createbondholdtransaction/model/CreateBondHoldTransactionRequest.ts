// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsDateString } from "class-validator"

export class CreateBondHoldTransactionRequest extends BaseTransactionRequest {
  @IsString()
  @IsOptional()
  partition?: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsDateString()
  @IsNotEmpty()
  expirationTimestamp: string

  @IsString()
  @IsNotEmpty()
  escrowAccountId: string

  @IsString()
  @IsOptional()
  data?: string
}
