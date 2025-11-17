// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from "class-validator"

export enum ClearingOperationType {
  TRANSFER = 0,
  REDEEM = 1,
  HOLD = 2,
}

export class CancelClearingTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number

  @IsNotEmpty()
  @IsEnum(ClearingOperationType)
  readonly operationType: ClearingOperationType

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    holderAccountId: string,
    partition: string | undefined,
    clearingId: number,
    operationType: ClearingOperationType,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.clearingId = clearingId
    this.operationType = operationType
  }
}
