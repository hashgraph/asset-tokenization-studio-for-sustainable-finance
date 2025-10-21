// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateOfferingTransactionRequest extends BaseTransactionRequest {
  @IsNotEmpty()
  @IsString()
  treasuryAddress: string

  @IsNotEmpty()
  @IsString()
  paymentTokenAddress: string

  @IsNotEmpty()
  @IsNumber()
  lotSize: number

  @IsNotEmpty()
  @IsNumber()
  minQuantity: number

  @IsNotEmpty()
  @IsNumber()
  maxQuantity: number

  @IsNotEmpty()
  @IsNumber()
  targetQuantity: number

  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @IsNotEmpty()
  @IsString()
  startDate: string

  @IsNotEmpty()
  @IsString()
  endDate: string

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number
}
