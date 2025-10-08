// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core/dist/event/Event"

export class BlockchainEvent extends Event {
  logTimestamp: string
  transactionHash: string
  name: string
  signature: string
  contractId: string;
  [key: string]: any
}
