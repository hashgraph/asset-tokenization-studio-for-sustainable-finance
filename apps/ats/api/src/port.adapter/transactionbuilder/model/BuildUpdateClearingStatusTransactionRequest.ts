// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import {IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional} from "class-validator"

export enum ClearingActionType {
  APPROVE = "APPROVE",
  CANCEL = "CANCEL",
  RECLAIM = "RECLAIM",
}

export class BuildUpdateClearingStatusTransactionRequest extends BaseBuildTransactionRequest {
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
}
