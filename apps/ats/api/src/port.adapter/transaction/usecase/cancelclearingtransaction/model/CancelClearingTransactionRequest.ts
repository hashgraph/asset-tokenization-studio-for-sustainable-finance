// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ClearingOperationType } from "@app/bond/transaction/cancelclearingtransaction/service/model/CancelClearingTransactionAppServiceRequest"
import { ApiProperty } from "@nestjs/swagger"

export class CancelClearingTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  partition?: string

  @ApiProperty({
    description: "Clearing operation type",
    enum: ClearingOperationType,
    example: ClearingOperationType.HOLD,
  })
  @IsNotEmpty()
  @IsEnum(ClearingOperationType)
  readonly operationType: ClearingOperationType
}
