// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenUpdatedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly newPaymentToken: string

  constructor(contractId: string, transactionHash: string, operator: string, newPaymentToken: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.newPaymentToken = newPaymentToken
  }
}
