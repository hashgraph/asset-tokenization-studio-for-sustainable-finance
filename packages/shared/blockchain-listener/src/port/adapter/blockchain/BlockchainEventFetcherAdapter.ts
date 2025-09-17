import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import BlockchainEvent from '@domain/event/BlockchainEvent';
import EventFetcherPort from '@port/adapter/blockchain/EventFetcherPort';

@Injectable()
export default class BlockchainEventFetcherAdapter implements EventFetcherPort {
    private readonly logger = new Logger(BlockchainEventFetcherAdapter.name);

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