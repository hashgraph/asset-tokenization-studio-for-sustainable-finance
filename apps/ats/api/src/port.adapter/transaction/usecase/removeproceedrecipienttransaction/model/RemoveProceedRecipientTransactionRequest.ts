// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class RemoveProceedRecipientTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Proceed recipient EVM address to remove",
    example: "0x1234567890123456789012345678901234567890",
  })
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string
}
