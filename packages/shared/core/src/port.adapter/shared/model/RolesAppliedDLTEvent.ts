// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "../../../event/DLTEvent"

export class RolesAppliedDLTEvent extends DLTEvent {
  readonly roles: string[]
  readonly actives: boolean[]
  readonly account: string

  constructor(contractId: string, transactionHash: string, roles: string[], actives: boolean[], account: string) {
    super(contractId, transactionHash)
    this.roles = roles
    this.actives = actives
    this.account = account
  }
}
