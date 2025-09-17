// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort"
import BlockchainEvent from '@domain/event/BlockchainEvent';
import Event from '@domain/event/Event';
import axios from "axios"

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name)

  interface MirrorNodeResponse {
    logs_bloom?: string
  }

  async fetchEvents(
    network: "testnet" | "previewnet" | "mainnet",
    blockNumber: number,
    contracts: string,
    eventsNames: string,
  ): Promise<Event[]> {
      this.logger.log(`Polling started for ${network} and block ${blockNumber}`);
      try {
        const mirrorNodeBaseUrl = this.getMirrorNodeBaseUrl(network);
        const logs: BlockchainEvent[] = await this.retrieveLogsFromMirrorNode(
          mirrorNodeBaseUrl, blockNumber
        )
        const events: Event[] = []
        for (const log of logs) {
          /*const event = this.decodeLog(log)
          if (event) {
            events.push(event)
          }*/
        }
        this.logger.debug(`Fetched blockchain events ${events.length} for block: ${blockNumber}`)
        return events
      } catch (error) {
        console.log("ERROR");
        //throw new BlockchainEventListenerError("Error listening events", error)
      }
  }

  private getMirrorNodeBaseUrl(network: string): string {
    switch (network) {
      case "mainnet":
        return "https://mainnet-public.mirrornode.hedera.com"
      case "previewnet":
        return "https://previewnet.mirrornode.hedera.com"
      case "testnet":
        return "https://testnet.mirrornode.hedera.com"
      default:
        throw new Error(`Unsupported network: ${network}`)
    }
  }

  private async retrieveLogsFromMirrorNode(
    mirrorNodeUrl: string,
    blockNumber: number
  ): Promise<BlockchainEvent[]> {
    try {
      const url = `${mirrorNodeUrl}/api/v1/blocks/${blockNumber}`
      this.logger.verbose(`Retrieving logs from Mirror Node: "${url}"`)
      const { data }: { data: MirrorNodeResponse } = await axios.get(url)
      const logsBloom = data.logs_bloom || []
console.log(logsBloom)
      return []
    } catch (error) {
      console.log("ERROR");
      //throw new BlockchainEventListenerError("Error extracting Mirror Node Logs", error)
    }
  }
}
