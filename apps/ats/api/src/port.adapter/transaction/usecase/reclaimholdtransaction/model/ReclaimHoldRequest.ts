// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ApiProperty } from "@nestjs/swagger"

export class ReclaimHoldRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Partition identifier",
    example: "0x0000000000000000000000000000000000000000000000000000000000000000",
  })
  @IsString()
  @IsNotEmpty()
  partition: string
}
