// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultItemEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BaseRedemptionExecutedDLTEvent extends DLTEvent {
  readonly results: PaymentResultItemEventModel[]

  protected constructor(contractId: string, transactionHash: string, results: PaymentResultItemEventModel[]) {
    super(contractId, transactionHash)
    this.results = results
  }
}
