import { Injectable, Inject } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"
import EventListenerPort from "@port/adapter/listener/EventListenerPort";
import type EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort";

@Injectable()
export default class BlockchainEventListenerAdapter implements EventListenerPort {
  private readonly logger = new Logger(BlockchainEventListenerAdapter.name);
  private intervalId: NodeJS.Timeout;
  private readonly network: "testnet" | "previewnet" | "mainnet";
  private readonly blockNumber: number;
  private readonly contracts: string;
  private readonly events: string;
  private readonly pollTimeout: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject("EventFetcherPort")
    private readonly eventFetcher: EventFetcherPort
  ) {
    this.network = configService.get("BLOCKCHAIN_LISTENER_NETWORK") ?? "testnet";
    this.blockNumber = configService.get("BLOCKCHAIN_LISTENER_BLOCK_NUMBER") ?? 0;
    this.contracts = configService.get("BLOCKCHAIN_LISTENER_CONTRACTS");
    this.events = configService.get("BLOCKCHAIN_LISTENER_EVENTS");
    this.pollTimeout = configService.get("BLOCKCHAIN_LISTENER_POLL_TIMEOUT");
  }

  subscribe(
    listener: (event: any) => void,
  ): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      const events = await this.eventFetcher.fetchEvents(
        this.network, this.blockNumber, this.contracts, this.events
      );
      for (const event of events) {
        listener(event);
      }
    }, this.pollTimeout);
  }

  async unsubscribe(
  ): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.log("Blockchain Polling stopped")
    }
  }
}
