// SPDX-License-Identifier: Apache-2.0

import Event from "@domain/event/Event.js";

export default interface EventFetcherPort {
  fetchEvents(network: "testnet" | "previewnet" | "mainnet",
              blockNumber: number,
              contracts: string,
              events: string): Promise<Event[]>;
}
