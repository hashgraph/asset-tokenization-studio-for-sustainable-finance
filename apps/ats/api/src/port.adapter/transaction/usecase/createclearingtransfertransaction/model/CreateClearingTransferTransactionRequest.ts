// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateClearingTransferTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  partition?: string

  @ApiProperty({
    description: "Amount of tokens to transfer",
    example: "1000000",
  })
  @IsNotEmpty()
  @IsString()
  amount: string

  @ApiProperty({
    description: "Transfer expiration timestamp",
    example: "2025-12-31T23:59:59.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expirationTimestamp: Date

  @ApiProperty({
    description: "Recipient Hedera account ID",
    example: "0.0.12345",
  })
  @IsNotEmpty()
  @IsString()
  toAccountId: string

  @ApiProperty({
    description: "Additional data (optional)",
    example: "0x",
    required: false,
  })
  @IsOptional()
  @IsString()
  data?: string
}
