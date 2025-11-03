// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { PaymentResultEventModel } from "./PaymentResultEventModel"

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionId: number
  readonly result: PaymentResultEventModel

  protected constructor(
    contractId: string,
    transactionHash: string,
    distributionId: number,
    result: PaymentResultEventModel,
  ) {
    super(contractId, transactionHash)
    this.distributionId = distributionId
    this.result = result
  }
}
