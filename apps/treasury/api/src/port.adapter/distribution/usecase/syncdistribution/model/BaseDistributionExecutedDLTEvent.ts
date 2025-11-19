// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionId: number
  readonly results: PaymentResultItemEventModel[]

  protected constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    results: PaymentResultItemEventModel[],
  ) {
    super(contractId, transactionHash)
    this.distributionId = distributionId
    this.results = results
  }
}
