// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class DissociatePaymentTokenTransactionRequest extends BaseTransactionRequest {
  constructor(format: string, accountId: string) {
    super(format, accountId)
  }
}
