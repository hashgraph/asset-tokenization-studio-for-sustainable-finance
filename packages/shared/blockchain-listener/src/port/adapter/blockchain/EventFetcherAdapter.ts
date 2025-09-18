import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core";
import BlockchainEvent from '@domain/event/BlockchainEvent';
import EventFetcherPort from '@port/adapter/blockchain/EventFetcherPort';

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
    private readonly logger = new Logger(EventFetcherAdapter.name);

    async fetchEvents(
      network: "testnet" | "previewnet" | "mainnet",
      blockNumber: number,
      contracts: string,
      events: string,
    ): Promise<BlockchainEvent[]> {
        this.logger.log(`Polling started for ${network} and block ${blockNumber}`);
        return [];
    }
}