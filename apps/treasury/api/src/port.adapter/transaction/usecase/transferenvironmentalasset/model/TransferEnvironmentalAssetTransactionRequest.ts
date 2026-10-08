// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ApiProperty } from "@nestjs/swagger"

export class TransferEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({ description: "Token id to transfer", example: 1, required: true })
  tokenId: number

  @ApiProperty({ description: "Account id to transfer the asset", example: "0.0.44567", required: true })
  toAccountId: string

  constructor(format: string, accountId: string, tokenId: number, toAccountId: string) {
    super(format, accountId)
    this.tokenId = tokenId
    this.toAccountId = toAccountId
  }
}
