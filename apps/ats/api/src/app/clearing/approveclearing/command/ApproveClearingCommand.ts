// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from "class-validator"
import { Command } from "@hashgraph/green-bonds-shared-core"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"

export class ApproveClearingCommand extends Command<void> {
  @IsNumber()
  clearingId: number

  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  operatorAccountId: string

  @IsEnum(ClearingOperationType)
  @IsNotEmpty()
  clearingOperationType: ClearingOperationType

  @IsOptional()
  @IsNumber()
  holdId?: number

  constructor(
    clearingId: number,
    bondContractId: string,
    holderAccountId: string,
    partition: string,
    operatorAccountId: string,
    clearingOperationType: ClearingOperationType,
    holdId?: number,
  ) {
    super()
    this.clearingId = clearingId
    this.bondContractId = bondContractId
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.operatorAccountId = operatorAccountId
    this.clearingOperationType = clearingOperationType
    this.holdId = holdId
  }
}
