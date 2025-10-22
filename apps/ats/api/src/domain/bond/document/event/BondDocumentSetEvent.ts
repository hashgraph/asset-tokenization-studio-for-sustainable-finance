// SPDX-License-Identifier: Apache-2.0
import { Event } from "@hashgraph/green-bonds-shared-core"

export class BondDocumentSetEvent extends Event {
  constructor(
    public readonly name: string,
    public readonly contractId: string,
    public readonly uri: string,
    public readonly hash: string,
  ) {
    super()
  }
}
