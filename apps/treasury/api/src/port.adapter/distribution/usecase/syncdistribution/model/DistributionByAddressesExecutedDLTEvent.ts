// SPDX-License-Identifier: Apache-2.0

import { BaseDistributionExecutedDLTEvent } from "./BaseDistributionExecutedDLTEvent"
import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"

export class DistributionByAddressesExecutedDLTEvent extends BaseDistributionExecutedDLTEvent {
  readonly holders: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    holders: string[],
    results: PaymentResultItemEventModel[],
  ) {
    super(contractId, transactionHash, distributionId, results)
    this.holders = holders
  }
}
