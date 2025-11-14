// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsDate, IsEnum, IsOptional } from "class-validator"

export enum ClearingStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CANCELED = "CANCELED",
  RECLAIMED = "RECLAIMED",
}

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
