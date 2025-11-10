// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@event/DLTEvent"

export class RoleGrantedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly account: string
  readonly role: string

  constructor(contractId: string, transactionHash: string, operator: string, account: string, role: string) {
    super(contractId, transactionHash)
    this.operator = operator
    this.account = account
    this.role = role
  }
}
