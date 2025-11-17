// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator"

export class CreateClearingHoldTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsNumber()
  expirationTimestamp: number

  @IsOptional()
  @IsString()
  toAddress?: string

  @IsNotEmpty()
  @IsString()
  escrowAddress: string

  @IsOptional()
  @IsString()
  data?: string
}
