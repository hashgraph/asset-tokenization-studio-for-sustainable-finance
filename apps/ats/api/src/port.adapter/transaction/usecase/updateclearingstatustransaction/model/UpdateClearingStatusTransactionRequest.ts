// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator"
import { ClearingActionType } from "@app/bond/transaction/updateclearingholdtransaction/service/model/ClearingActionType"
import { ClearingOperationType } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateClearingStatusTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  partition?: string

  @ApiProperty({
    description: "Clearing action type",
    enum: ClearingActionType,
    example: ClearingActionType.APPROVE,
  })
  @IsNotEmpty()
  @IsEnum(ClearingActionType)
  action: ClearingActionType

  @ApiProperty({
    description: "Clearing operation type",
    enum: ClearingOperationType,
    example: ClearingOperationType.HOLD,
  })
  @IsNotEmpty()
  @IsEnum(ClearingOperationType)
  readonly operationType: ClearingOperationType
}
