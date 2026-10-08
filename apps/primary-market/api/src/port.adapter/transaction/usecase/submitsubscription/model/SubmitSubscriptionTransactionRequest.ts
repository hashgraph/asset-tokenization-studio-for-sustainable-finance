// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SubmitSubscriptionTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "The number of lot units to subscribe for",
    example: "100",
  })
  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string
}
