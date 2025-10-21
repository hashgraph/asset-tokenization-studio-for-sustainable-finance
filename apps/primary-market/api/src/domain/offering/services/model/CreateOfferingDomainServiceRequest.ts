// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator"

export class CreateOfferingDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  bondId: string

  @IsNotEmpty()
  @IsString()
  treasuryId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenId: string

  @IsNotEmpty()
  @IsString()
  lotSize: string

  @IsNotEmpty()
  @IsString()
  minQuantity: string

  @IsNotEmpty()
  @IsString()
  maxQuantity: string

  @IsNotEmpty()
  @IsString()
  targetQuantity: string

  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @IsNotEmpty()
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number
}
