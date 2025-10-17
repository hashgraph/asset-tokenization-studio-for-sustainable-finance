// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class TransferEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  tokenId: number
  to: string

  constructor(format: string, accountId: string, tokenId: number, to: string) {
    super(format, accountId)
    this.tokenId = tokenId
    this.to = to
  }
}
