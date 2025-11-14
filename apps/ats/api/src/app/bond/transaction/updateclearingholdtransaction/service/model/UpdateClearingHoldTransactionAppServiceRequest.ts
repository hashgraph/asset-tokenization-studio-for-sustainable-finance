// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from "class-validator"
import { ClearingActionType } from "./ClearingActionType"

export class UpdateClearingHoldTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
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
  @IsNumber()
  readonly operationType: number = 2 // Always HOLD type

  @IsNotEmpty()
  @IsEnum(ClearingActionType)
  action: ClearingActionType

  constructor(
    format: string,
    accountId: string,
    bondContractId: string,
    holderAccountId: string,
    partition: string | undefined,
    clearingId: number,
    action: ClearingActionType,
  ) {
    super(format, accountId, bondContractId)
    this.holderAccountId = holderAccountId
    this.partition = partition
    this.clearingId = clearingId
    this.action = action
  }
}
