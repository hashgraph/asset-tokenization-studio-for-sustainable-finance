// SPDX-License-Identifier: Apache-2.0

import { FetchEventsRequest } from "@port/blockchain/model/FetchEventsRequest"
import { GetBlockResponse } from "@port/blockchain/model/GetBlockResponse"
import { BlockchainEvent } from "@port/blockchain/model/BlockchainEvent"
import { GetBlockRequest } from "@port/blockchain/model/GetBlockRequest"

export interface HederaPort {
  getBlock(getBlockRequest: GetBlockRequest): Promise<GetBlockResponse>

  getLastBlockNumber(): Promise<number>

  fetchEvents(request: FetchEventsRequest): Promise<BlockchainEvent[]>
}
