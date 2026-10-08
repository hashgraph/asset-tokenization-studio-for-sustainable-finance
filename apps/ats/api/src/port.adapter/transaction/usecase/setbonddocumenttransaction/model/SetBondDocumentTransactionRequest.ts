// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import { IsBytes32 } from "@utils/IsBytes32"
import { ApiProperty } from "@nestjs/swagger"

export class SetBondDocumentTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Document URI",
    example: "ipfs://QmXyz123...",
  })
  @IsString()
  @IsNotEmpty()
  uri: string

  @ApiProperty({
    description: "Document hash (bytes32)",
    example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  })
  @IsString()
  @IsNotEmpty()
  @IsBytes32()
  hash: string
}
