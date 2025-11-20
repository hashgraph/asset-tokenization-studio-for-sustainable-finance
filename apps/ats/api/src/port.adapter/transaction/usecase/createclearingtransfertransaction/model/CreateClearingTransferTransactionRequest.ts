// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator"

export class CreateClearingTransferTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsNumber()
  expirationTimestamp: number

  @IsNotEmpty()
  @IsString()
  toAccountId: string

  @IsOptional()
  @IsString()
  data?: string
}
