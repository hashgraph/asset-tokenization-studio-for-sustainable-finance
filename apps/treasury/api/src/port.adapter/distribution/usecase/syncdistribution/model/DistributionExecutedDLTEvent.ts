// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export class DistributionExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly pageIndex: number
  readonly pageLength: number

  constructor(
    contractId: string,
    transactionHash: string,
    distributionID: number,
    pageIndex: number,
    pageLength: number,
    results: PaymentResultEventModel[],
  ) {
    super(contractId, transactionHash, distributionID, results)
    this.pageIndex = pageIndex
    this.pageLength = pageLength
  }
}
