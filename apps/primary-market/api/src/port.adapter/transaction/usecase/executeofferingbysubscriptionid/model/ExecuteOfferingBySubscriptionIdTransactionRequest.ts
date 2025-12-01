// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsArray, IsNotEmpty, IsNumber, ArrayMinSize } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class ExecuteOfferingBySubscriptionIdTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Array of subscription IDs to execute",
    example: [1, 2, 3],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  subscriptionIds: number[]
}
