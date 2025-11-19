// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"

export class DistributionExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly pageIndex: number
  readonly pageLength: number

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    pageIndex: number,
    pageLength: number,
    results: PaymentResultItemEventModel[],
  ) {
    super(contractId, transactionHash, distributionId, results)
    this.pageIndex = pageIndex
    this.pageLength = pageLength
  }
}
