// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultEventModel } from "./PaymentResultEventModel"

export class DistributionByAddressesExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly holders: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    holders: string[],
    result: PaymentResultEventModel,
  ) {
    super(contractId, transactionHash, distributionId, result)
    this.holders = holders
  }
}
