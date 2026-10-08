// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNumberString, IsNotEmpty, IsString, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ReleaseBondLockTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Lock ID to release",
    example: "1",
  })
  @IsNumberString()
  @IsNotEmpty()
  lockId: string

  @ApiProperty({
    description: "Partition identifier (optional)",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
    required: false,
  })
  @IsString()
  @IsOptional()
  partition?: string
}
