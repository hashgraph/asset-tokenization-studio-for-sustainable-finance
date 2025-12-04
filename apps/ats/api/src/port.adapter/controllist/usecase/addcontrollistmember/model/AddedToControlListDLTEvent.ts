// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class AddedToControlListDLTEvent extends DLTEvent {
  readonly operator: string
  readonly account: string

  constructor(contractId: string, transactionHash: string, operator: string, account: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.account = account
  }
}
