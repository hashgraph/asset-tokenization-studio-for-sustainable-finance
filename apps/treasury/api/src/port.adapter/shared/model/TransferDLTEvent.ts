// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class TransferDLTEvent extends DLTEvent {
  readonly from: string
  readonly to: string
  readonly value?: string
  readonly tokenId?: number

  constructor(contractId: string, transactionHash: string, from: string, to: string, value?: string, tokenId?: number) {
    super(contractId, transactionHash)
    this.from = from
    this.to = to
    this.value = value
    this.tokenId = tokenId
  }
}
