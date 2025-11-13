// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "../../../event/DLTEvent"

export class RoleRenouncedDLTEvent extends DLTEvent {
  readonly account: string
  readonly role: string

  constructor(contractId: string, transactionHash: string, account: string, role: string) {
    super(contractId, transactionHash)
    this.account = account
    this.role = role
  }
}
