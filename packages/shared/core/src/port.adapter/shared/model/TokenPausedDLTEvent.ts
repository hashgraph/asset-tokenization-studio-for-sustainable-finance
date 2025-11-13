// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "../../../event/DLTEvent"

export class TokenPausedDLTEvent extends DLTEvent {
  readonly operator: string

  constructor(contractId: string, transactionHash: string, operator: string) {
    super(contractId, transactionHash)
    this.operator = operator
  }
}
