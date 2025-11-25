// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BaseRedemptionExecutedDLTEvent extends DLTEvent {
  readonly results: PaymentResultEventModel[]

  protected constructor(contractId: string, transactionHash: string, results: PaymentResultEventModel[]) {
    super(contractId, transactionHash)
    this.results = results
  }
}
