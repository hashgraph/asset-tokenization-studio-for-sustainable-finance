// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ApiProperty } from "@nestjs/swagger"

export class ReleaseHoldRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
  })
  @IsString()
  @IsNotEmpty()
  partition: string

  @ApiProperty({
    description: "Amount of tokens to release",
    example: "1000000",
  })
  @IsString()
  @IsNotEmpty()
  amount: string
}
