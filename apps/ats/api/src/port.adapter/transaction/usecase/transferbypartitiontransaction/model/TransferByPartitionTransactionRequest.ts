// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class TransferByPartitionTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsString()
  @IsOptional()
  partition?: string

  @ApiProperty({
    description: "Amount of tokens to transfer",
    example: "1000000",
  })
  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @ApiProperty({
    description: "Additional data (optional)",
    example: "0x",
    required: false,
  })
  @IsString()
  @IsOptional()
  data?: string
}
