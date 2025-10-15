// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetTransferCreatedEvent extends Event {
  constructor(
    readonly environmentalAssetId: string,
    readonly serialNumber: number,
    readonly fromAccountId: string,
    readonly toAccountId: string,
  ) {
    super()
  }
}
