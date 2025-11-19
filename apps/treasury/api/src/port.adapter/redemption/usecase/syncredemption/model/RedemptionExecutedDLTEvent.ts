// SPDX-License-Identifier: Apache-2.0

import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"
import { BaseRedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/BaseRedemptionExecutedDLTEvent"

export class RedemptionExecutedDLTEvent extends BaseRedemptionExecutedDLTEvent {
  readonly pageIndex: number
  readonly pageLength: number

  constructor(
    contractId: string,
    transactionHash: string,
    pageIndex: number,
    pageLength: number,
    results: PaymentResultItemEventModel[],
  ) {
    super(contractId, transactionHash, results)
    this.pageIndex = pageIndex
    this.pageLength = pageLength
  }
}
