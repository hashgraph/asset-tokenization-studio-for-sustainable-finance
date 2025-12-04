// SPDX-License-Identifier: Apache-2.0
import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class MaxSupplySetDLTEvent extends DLTEvent {
  readonly operator: string
  readonly newMaxSupply: string
  readonly previousMaxSupply: string

  constructor(
    contractId: string,
    transactionHash: string,
    operator: string,
    newMaxSupply: string,
    previousMaxSupply: string,
  ) {
    super(contractId, transactionHash)
    this.operator = operator
    this.newMaxSupply = newMaxSupply
    this.previousMaxSupply = previousMaxSupply
  }
}
