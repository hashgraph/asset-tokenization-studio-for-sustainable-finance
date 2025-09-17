import BlockchainEvent from "@domain/event/BlockchainEvent.js";

export default interface EventFetcherPort {
  fetchEvents(network: "testnet" | "previewnet" | "mainnet",
              blockNumber: number,
              contracts: string,
              events: string): Promise<BlockchainEvent[]>;
}