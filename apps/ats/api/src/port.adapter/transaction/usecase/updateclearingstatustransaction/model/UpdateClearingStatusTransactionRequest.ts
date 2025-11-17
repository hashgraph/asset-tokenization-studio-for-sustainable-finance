// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator"
import { ClearingActionType } from "@app/bond/transaction/updateclearingholdtransaction/service/model/ClearingActionType"
import { ClearingOperationType } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"

export class UpdateClearingStatusTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsEnum(ClearingActionType)
  action: ClearingActionType

  @IsNotEmpty()
  @IsEnum(ClearingOperationType)
  readonly operationType: ClearingOperationType
}
