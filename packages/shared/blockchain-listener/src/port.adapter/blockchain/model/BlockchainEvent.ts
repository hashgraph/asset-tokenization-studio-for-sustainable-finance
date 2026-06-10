// SPDX-License-Identifier: Apache-2.0

import { Event } from "@hashgraph/green-bonds-shared-core"

export class BlockchainEvent extends Event {
  logTimestamp: string
  txId: string
  txHash: string
  name: string
  signature: string
  contractId: string;
  [key: string]: any
}
