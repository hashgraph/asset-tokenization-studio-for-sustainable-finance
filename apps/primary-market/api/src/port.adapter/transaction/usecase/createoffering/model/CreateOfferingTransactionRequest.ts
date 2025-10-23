// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator"

export class CreateOfferingTransactionRequest extends BaseTransactionRequest {
  @IsNotEmpty()
  @IsString()
  treasuryAddress: string

  @IsNotEmpty()
  @IsString()
  paymentTokenAddress: string

  @IsNotEmpty()
  @IsNumberString()
  lotSize: string

  @IsNotEmpty()
  @IsNumberString()
  minQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  maxQuantity: string

  @IsNotEmpty()
  @IsNumberString()
  targetQuantity: string

  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @IsNotEmpty()
  @IsNumberString()
  startDate: string

  @IsNotEmpty()
  @IsNumberString()
  endDate: string

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number
}
