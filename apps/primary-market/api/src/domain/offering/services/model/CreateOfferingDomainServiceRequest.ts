// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"

export class CreateOfferingDomainServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
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
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number
}
