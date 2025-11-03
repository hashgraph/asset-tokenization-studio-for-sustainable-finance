// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultEventModel } from "./PaymentResultEventModel"

export class DistributionExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly pageIndex: number
  readonly pageLength: number

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    pageIndex: number,
    pageLength: number,
    result: PaymentResultEventModel,
  ) {
    super(contractId, transactionHash, distributionId, result)
    this.pageIndex = pageIndex
    this.pageLength = pageLength
  }
}
