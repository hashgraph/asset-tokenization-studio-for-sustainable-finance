// SPDX-License-Identifier: Apache-2.0

import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"
import { BaseRedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/BaseRedemptionExecutedDLTEvent"

export class RedemptionByAddressesExecutedDLTEvent extends BaseRedemptionExecutedDLTEvent {
  readonly holders: string[]

  constructor(contractId: string, transactionHash: string, holders: string[], result: PaymentResultEventModel) {
    super(contractId, transactionHash, result)
    this.holders = holders
  }
}
