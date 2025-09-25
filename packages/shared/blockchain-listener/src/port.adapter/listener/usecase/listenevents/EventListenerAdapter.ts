// SPDX-License-Identifier: Apache-2.0
import { Singleton, Logger, Inject } from "@hashgraph/green-bonds-shared-core"
import EventListenerPort from "./EventListenerPort"
import type EventFetcherPort from "@port/blockchain/usecase/fetchevents/EventFetcherPort"

@Singleton()
export default class EventListenerAdapter implements EventListenerPort {
  private readonly logger = new Logger(EventListenerAdapter.name)
  private blockNumber: number
  private intervalId: NodeJS.Timeout

  constructor(@Inject() private readonly eventFetcher: EventFetcherPort) {
    this.blockNumber = +process.env.BLOCKCHAIN_LISTENER_BLOCK_NUMBER
  }

  subscribe(listener: (event: any) => void): void {
    if (this.intervalId) return

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.intervalId = setInterval(async () => {
      const blockNumberCurrentlyBeingProcessed = this.eventFetcher.getBlockNumberCurrentlyBeingProcessed()
      if (!blockNumberCurrentlyBeingProcessed || this.blockNumber > blockNumberCurrentlyBeingProcessed) {
        const events = await this.eventFetcher.fetchEventsFromBlock(this.blockNumber)
        if (events) {
          for (const event of events) {
            listener(event)
          }
        }
        ++this.blockNumber
      }
    }, +process.env.BLOCKCHAIN_LISTENER_POLL_TIMEOUT)
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-misused-promises
  async unsubscribe(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.log("Blockchain Polling stopped")
    }
  }
}
