// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsDate, IsEnum, IsOptional } from "class-validator"

export enum ClearingStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CANCELED = "CANCELED",
  RECLAIMED = "RECLAIMED",
}

export class ClearingHold extends BaseEntity {
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
}
