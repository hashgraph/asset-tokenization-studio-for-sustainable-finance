// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionId: number
  readonly results: PaymentResultEventModel[]

  protected constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    results: PaymentResultEventModel[],
  ) {
    super(contractId, transactionHash)
    this.distributionId = distributionId
    this.results = results
  }
}
