// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"
import { OfferingProcessResult } from "@domain/shared/model/OfferingProcessResult"

export class OfferingExecutedDLTEvent extends DLTEvent {
  readonly offeringId: number
  readonly operator: string
  readonly result: OfferingProcessResult[]

  constructor(
    contractId: string,
    transactionHash: string,
    offeringId: number,
    operator: string,
    result: OfferingProcessResult[],
  ) {
    super(contractId, transactionHash)
    this.offeringId = offeringId
    this.operator = operator
    this.result = result
  }
}
