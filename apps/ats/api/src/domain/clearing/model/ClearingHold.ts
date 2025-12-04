// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsEnum, IsOptional } from "class-validator"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"

export class ClearingHold {
  @IsNotEmpty()
  @IsNumber()
  id: number

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  expirationDate: Date

  @IsNotEmpty()
  @IsEnum(ClearingStatus)
  status: ClearingStatus

  @IsOptional()
  @IsString()
  toAccountId?: string

  @IsNotEmpty()
  @IsString()
  escrowAccountId: string

  @IsOptional()
  @IsString()
  data?: string

  @IsOptional()
  @IsString()
  operatorData?: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsNotEmpty()
  @IsDate()
  createdAt: Date

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date

  isExpired(): boolean {
    return new Date() > this.expirationDate
  }

  validateNotExpired(): void {
    if (this.isExpired()) {
      throw new Error(`Clearing ${this.id} has expired`)
    }
  }
}
