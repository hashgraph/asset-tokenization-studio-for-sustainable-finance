// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent, PaymentResult } from "./BaseDistributionExecutedDLTEvent"

export class DistributionExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly pageIndex: number
  readonly pageLength: number

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    pageIndex: number,
    pageLength: number,
    result: PaymentResult,
  ) {
    super(contractId, transactionHash, distributionId, result)
    this.pageIndex = pageIndex
    this.pageLength = pageLength
  }
}
