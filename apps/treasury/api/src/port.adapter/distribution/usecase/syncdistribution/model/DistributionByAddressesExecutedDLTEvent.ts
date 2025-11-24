// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export class DistributionByAddressesExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly holders: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    holders: string[],
    results: PaymentResultEventModel[],
  ) {
    super(contractId, transactionHash, distributionId, results)
    this.holders = holders
  }
}
