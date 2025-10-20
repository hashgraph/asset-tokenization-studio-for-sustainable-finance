// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, Min } from "class-validator"

export class ExternalTransferEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  @Min(0)
  tokenId: number

  @IsNotEmpty()
  accountId: string

  constructor(format: string, accountId: string, tokenId: number) {
    super(format, accountId)
    this.tokenId = tokenId
    this.accountId = accountId
  }
}
