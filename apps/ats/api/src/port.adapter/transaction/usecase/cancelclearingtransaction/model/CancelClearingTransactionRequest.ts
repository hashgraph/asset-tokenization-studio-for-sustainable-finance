// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ClearingOperationType } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"

export class CancelClearingTransactionRequest extends BaseTransactionRequest {
  @IsOptional()
  @IsString()
  partition?: string

  @IsNotEmpty()
  @IsEnum(ClearingOperationType)
  readonly operationType: ClearingOperationType
}
