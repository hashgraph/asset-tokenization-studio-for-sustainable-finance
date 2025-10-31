// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface PaymentResult {
  failedAddresses: string[]
  succeededAddresses: string[]
  alreadyPaidAddresses: string[]
  paidAmounts: string[]
}

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionId: number
  readonly result: PaymentResult

  constructor(contractId: string, transactionHash: string, distributionId: number, result: PaymentResult) {
    super(contractId, transactionHash)
    this.distributionId = distributionId
    this.result = result
  }
}
