// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class TokenPausedDLTEvent extends DLTEvent {
  readonly operator: string

  constructor(contractId: string, transactionHash: string, operator: string) {
    super(contractId, transactionHash)
    this.operator = operator
  }
}
