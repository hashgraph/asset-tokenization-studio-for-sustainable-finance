// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ExternalTransferEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Token id to transfer", example: 1, required: true })
  @Min(0)
  tokenId: number

  @ApiProperty({ description: "Account id that will be the holder of the asset", example: 1, required: true })
  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, tokenId: number) {
    super(format, accountId)
    this.tokenId = tokenId
    this.accountId = accountId
  }
}
