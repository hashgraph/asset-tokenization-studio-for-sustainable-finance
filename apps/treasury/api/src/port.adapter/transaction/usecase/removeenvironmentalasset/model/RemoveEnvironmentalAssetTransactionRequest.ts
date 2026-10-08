// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class RemoveEnvironmentalAssetTransactionRequest extends BaseTransactionRequest {
  constructor(format: string, accountId: string) {
    super(format, accountId)
  }
}
