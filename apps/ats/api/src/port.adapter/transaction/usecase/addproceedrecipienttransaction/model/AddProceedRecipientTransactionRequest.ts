// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AddProceedRecipientTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Proceed recipient EVM address",
    example: "0x1234567890123456789012345678901234567890",
  })
  @IsString()
  @IsNotEmpty()
  proceedRecipientAddress: string

  @ApiProperty({
    description: "Additional data (optional)",
    example: "0x",
    required: false,
  })
  @IsString()
  @IsOptional()
  data?: string
}
