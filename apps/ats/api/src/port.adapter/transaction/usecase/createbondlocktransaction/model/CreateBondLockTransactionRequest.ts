// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateBondLockTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsString()
  @IsOptional()
  partition?: string

  @ApiProperty({
    description: "Amount of tokens to lock",
    example: "1000000",
  })
  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @ApiProperty({
    description: "Lock expiration timestamp",
    example: "2025-12-31T23:59:59.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  expirationTimestamp: Date
}
