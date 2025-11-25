// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionID: number
  readonly results: PaymentResultEventModel[]

  protected constructor(
    contractId: string,
    transactionHash: string,
    distributionID: number,
    results: PaymentResultEventModel[],
  ) {
    super(contractId, transactionHash)
    this.distributionID = distributionID
    this.results = results
  }
}
