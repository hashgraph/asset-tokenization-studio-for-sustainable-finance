// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ApiProperty } from "@nestjs/swagger"

export class ExecuteHoldRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
  })
  @IsString()
  @IsNotEmpty()
  partition: string

  @ApiProperty({
    description: "Recipient Hedera account ID",
    example: "0.0.12345",
  })
  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @ApiProperty({
    description: "Amount of tokens to execute",
    example: "1000000",
  })
  @IsString()
  @IsNotEmpty()
  amount: string
}
