// SPDX-License-Identifier: Apache-2.0

import { Event } from "./Event"

export abstract class DLTEvent extends Event {
  readonly contractId: string
  readonly transactionHash: string

  protected constructor(contractId: string, transactionHash: string) {
    super()
    this.contractId = contractId
    this.transactionHash = transactionHash
  }
}
