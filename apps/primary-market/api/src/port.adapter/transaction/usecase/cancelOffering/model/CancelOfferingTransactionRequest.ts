// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CancelOfferingTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "The start index for batch processing of subscriptions to cancel",
    example: "0",
  })
  @IsNotEmpty()
  @IsNumberString()
  start: string

  @ApiProperty({
    description: "The end index for batch processing of subscriptions to cancel",
    example: "10",
  })
  @IsNotEmpty()
  @IsNumberString()
  end: string
}
