// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionAppServiceRequest } from "@transaction/model/BaseTransactionAppServiceRequest"

export class UnpauseTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  constructor(format: string, accountId: string, contractId: string) {
    super(format, accountId, contractId)
  }
}
