// SPDX-License-Identifier: Apache-2.0
import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import EventListenerPort from "@port/adapter/listener/usecase/listenevents/EventListenerPort"
import EventFetcherAdapter from "@port/adapter/blockchain/usecase/fetchevents/EventFetcherAdapter"

@Singleton()
export default class EventListenerAdapter implements EventListenerPort {
  private readonly logger = new Logger(EventListenerAdapter.name)
  private intervalId: NodeJS.Timeout

  constructor(private readonly eventFetcher: EventFetcherAdapter) {}

  subscribe(listener: (event: any) => void): void {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      const events = await this.eventFetcher.fetchEvents()
      if (events) {
        for (const event of events) {
          listener(event)
        }
      }
    }, +process.env.BLOCKCHAIN_LISTENER_POLL_TIMEOUT)
  }

  async unsubscribe(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.log("Blockchain Polling stopped")
    }
  }
}
