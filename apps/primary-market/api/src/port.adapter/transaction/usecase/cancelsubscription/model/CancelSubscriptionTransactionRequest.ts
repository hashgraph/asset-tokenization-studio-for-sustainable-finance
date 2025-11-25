// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CancelSubscriptionTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "The unique identifier of the subscription to cancel",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number
}
