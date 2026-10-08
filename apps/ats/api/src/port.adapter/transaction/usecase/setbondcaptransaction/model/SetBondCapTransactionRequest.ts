// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SetBondCapTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "New maximum supply for the bond",
    example: "10000000",
  })
  @IsNumberString()
  @IsNotEmpty()
  newMaxSupply: string
}
