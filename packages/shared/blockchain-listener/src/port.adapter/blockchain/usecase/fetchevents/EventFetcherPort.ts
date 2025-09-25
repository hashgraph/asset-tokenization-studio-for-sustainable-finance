// SPDX-License-Identifier: Apache-2.0

import BlockchainEvent from "@domain/event/BlockchainEvent.js"

export default interface EventFetcherPort {
  fetchEventsFromBlock(blockNumber: number): Promise<BlockchainEvent[]>
  getBlockNumberCurrentlyBeingProcessed(): number
}
