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
  minLots: string

  @IsNotEmpty()
  @IsNumberString()
  maxLots: string

  @IsNotEmpty()
  @IsNumberString()
  targetLots: string

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

  @IsNotEmpty()
  @IsNumberString()
  price: string
}
