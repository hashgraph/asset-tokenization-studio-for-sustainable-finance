// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"

export class UnpauseTreasuryTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  constructor(format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
  }
}
