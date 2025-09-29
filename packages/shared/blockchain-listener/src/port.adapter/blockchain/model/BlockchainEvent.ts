// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core/dist/event/Event"

export class BlockchainEvent extends Event {
  logTimestamp: string
  transactionHash: string
  name: string
  signature: string;
  [key: string]: any
}
