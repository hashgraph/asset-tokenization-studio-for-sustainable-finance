// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"
import { OfferingProcessResult } from "@domain/shared/model/OfferingProcessResult"

export class OfferingExecutedEvent extends Event {
  constructor(
    public readonly offeringId: number,
    public readonly marketContractId: string,
    public readonly operatorAccountId: string,
    public readonly processResults: OfferingProcessResult[],
  ) {
    super()
  }
}
