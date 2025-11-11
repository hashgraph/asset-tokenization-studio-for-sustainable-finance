// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"

export class CreateOfferingDomainServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsNotEmpty()
  @IsString()
  treasuryContractId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenContractId: string

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
