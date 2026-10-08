// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class PaymentTokenUpdatedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly newPaymentToken: string
  readonly oldPaymentToken: string
  readonly dissociationError: number

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    newPaymentToken: string,
    oldPaymentToken: string,
    dissociationError: number,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.newPaymentToken = newPaymentToken
    this.oldPaymentToken = oldPaymentToken
    this.dissociationError = dissociationError
  }
}
