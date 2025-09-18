// SPDX-License-Identifier: Apache-2.0
import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import { ConfigService } from "@nestjs/config"
import EventListenerPort from "@port/adapter/listener/EventListenerPort"
import EventFetcherAdapter from "@port/adapter/blockchain/EventFetcherAdapter"

@Singleton()
export default class EventListenerAdapter implements EventListenerPort {
  private readonly logger = new Logger(EventListenerAdapter.name);
  private intervalId: NodeJS.Timeout;
  private readonly pollTimeout: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventFetcher: EventFetcherAdapter,
  ) {
    this.pollTimeout = configService.get("BLOCKCHAIN_LISTENER_POLL_TIMEOUT");
  }

  subscribe(listener: (event: any) => void): void {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      const events = await this.eventFetcher.fetchEvents();
      if (events){
        for (const event of events) {
          listener(event);
        }
      }
    }, this.pollTimeout)
  }

  async unsubscribe(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.log("Blockchain Polling stopped")
    }
  }
}
