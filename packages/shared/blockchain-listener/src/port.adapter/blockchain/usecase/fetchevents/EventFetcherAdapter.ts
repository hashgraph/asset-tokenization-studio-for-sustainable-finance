// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger, Inject } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "./EventFetcherPort"
import type BlockchainEventsPort from "@port/blockchain/usecase/blockchainevents/BlockchainEventsPort"
import type DecodeEventPort from "@port/blockchain/usecase/decodeevent/DecodeEventPort"
import BlockchainEvent from "@domain/event/BlockchainEvent"
import { GetContractsResultsResultsByBlockNumberResponse } from "@port/blockchain/usecase/blockchainevents/responses/GetContractsResultsByBlockNumberResponse"

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name)
  private blockNumber: number

  constructor(
    @Inject() private readonly blockchainEvents: BlockchainEventsPort,
    @Inject() private readonly decodeEvent: DecodeEventPort,
  ) {}

  getBlockNumberCurrentlyBeingProcessed(): number {
    return this.blockNumber
  }

  async fetchEventsFromBlock(blockNumber: number): Promise<BlockchainEvent[]> {
    this.logger.log(
      `Polling started for ${process.env.BLOCKCHAIN_LISTENER_NETWORK ?? "testnet"} and block ${blockNumber}`,
    )
    const events: BlockchainEvent[] = []
    this.blockNumber = blockNumber

    try {
      const contractsResultsHashes = await this.getContractsResultsHashesContainingTrackedEvents()

      for (const blockHash of contractsResultsHashes) {
        const contractResults = await this.blockchainEvents.getContractsResultsByBlockHash({
          blockHash,
        })
        events.push(
          ...contractResults.logs
            .map((log) =>
              this.decodeEvent.decodeLog({
                ...log,
                transactionHash: blockHash,
                timestamp: contractResults.timestamp,
              }),
            )
            .filter((decoded): decoded is BlockchainEvent => decoded != null),
        )
      }
      return events
    } catch (error) {
      this.logger.error(`Error fetching events from block ${blockNumber}: ${error}`)
    }
  }

  private async getContractsResultsHashesContainingTrackedEvents(): Promise<string[]> {
    const contractsResultsHashesList: string[] = []

    try {
      const contractsResultsByBlockNumber = await this.blockchainEvents.getContractsResultsByBlockNumber({
        blockNumber: this.blockNumber,
      })

      const contractResultsHashes = this.getContractsResultsHashesFilteredByContract(
        contractsResultsByBlockNumber.results,
      )

      contractsResultsHashesList.push(...contractResultsHashes)

      if (contractsResultsByBlockNumber.links) {
        while (contractsResultsByBlockNumber.links.next) {
          const nextUrl = new URL(contractsResultsByBlockNumber.links.next)
          const relativePath = nextUrl.pathname + nextUrl.search
          const query = relativePath.replace(/^\/api\/v1\//, "")

          const contractsResultsByNextBlockNumber = await this.blockchainEvents.getNextContractsResultsByBlockNumber({
            query,
          })
          const nextContractResultsHashes = this.getContractsResultsHashesFilteredByContract(
            contractsResultsByNextBlockNumber.results,
          )
          contractsResultsHashesList.push(...nextContractResultsHashes)

          contractsResultsByBlockNumber.links = contractsResultsByNextBlockNumber.links
        }
      }

      return contractsResultsHashesList
    } catch (error) {
      this.logger.error(`Error getting contracts results hashes: ${error}`)
    }
  }

  private getContractsResultsHashesFilteredByContract(
    results: GetContractsResultsResultsByBlockNumberResponse[],
  ): string[] {
    return results
      .filter(
        (res) =>
          (res.address && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.address)) ||
          (res.to && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.to)),
      )
      .map((res) => res.hash)
      .filter((hash): hash is string => Boolean(hash))
  }
}
