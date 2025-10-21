// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenTransferredDLTEvent extends DLTEvent {
  readonly to: string
  readonly amount: bigint

  constructor(contractId: string, transactionHash: string, to: string, amount: bigint) {
    super(contractId, transactionHash)
    this.to = to
    this.amount = amount
  }
}
