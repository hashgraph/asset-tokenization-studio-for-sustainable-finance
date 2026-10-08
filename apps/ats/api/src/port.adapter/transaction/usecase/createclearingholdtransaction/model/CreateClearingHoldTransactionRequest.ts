// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateClearingHoldTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsOptional()
  @IsString()
  partition?: string

  @ApiProperty({
    description: "Amount of tokens to hold",
    example: "1000000",
  })
  @IsNotEmpty()
  @IsString()
  amount: string

  @ApiProperty({
    description: "Hold expiration timestamp",
    example: "2025-12-31T23:59:59.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expirationTimestamp: Date

  @ApiProperty({
    description: "Escrow EVM address",
    example: "0x1234567890123456789012345678901234567890",
  })
  @IsNotEmpty()
  @IsString()
  escrowAddress: string

  @ApiProperty({
    description: "Additional data (optional)",
    example: "0x",
    required: false,
  })
  @IsOptional()
  @IsString()
  data?: string
}
