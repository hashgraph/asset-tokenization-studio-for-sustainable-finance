// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from "class-validator"

export class CreateClearingHoldDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  expirationDate: Date

  @IsOptional()
  @IsString()
  toAddress?: string

  @IsOptional()
  @IsString()
  escrowAddress?: string

  @IsOptional()
  @IsString()
  data?: string

  @IsOptional()
  @IsString()
  operatorData?: string

  @IsNotEmpty()
  @IsString()
  operator: string
}
