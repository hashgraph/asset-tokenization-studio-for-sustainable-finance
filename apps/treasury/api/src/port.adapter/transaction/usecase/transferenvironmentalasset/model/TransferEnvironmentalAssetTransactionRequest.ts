// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class TransferEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  tokenId: string
  to: string

  constructor(format: string, accountId: string, tokenId: string, to: string) {
    super(format, accountId)
    this.tokenId = tokenId
    this.to = to
  }
}
