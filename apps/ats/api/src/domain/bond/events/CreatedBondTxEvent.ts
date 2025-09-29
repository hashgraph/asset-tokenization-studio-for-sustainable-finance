// SPDX-License-Identifier: Apache-2.0
import { Event } from '@hashgraph/green-bonds-shared-core'

export class CreatedBondTxEvent extends Event {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly format: string,
    public readonly symbol: string,
    public readonly tx: string,
  ) {
    super()
  }
}
