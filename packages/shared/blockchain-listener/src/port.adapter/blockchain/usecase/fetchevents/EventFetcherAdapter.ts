// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger, Inject } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "./EventFetcherPort"
import type MirrorNodePort from "@port/blockchain/usecase/querymirrornode/MirrorNodePort"
import type DecodeEventPort from "@port/blockchain/usecase/decodeevent/DecodeEventPort"
import BlockchainEvent from "@domain/event/BlockchainEvent"

interface MirrorNodeContractsResultsResponse {
  results?: MirrorNodeContractResultResponse[]
  links?: MirrorNodeContractsResultsResponseLinks
}

interface MirrorNodeContractsResultsResponseLinks {
  next?: string
}

interface MirrorNodeContractResultResponse {
  hash?: string
  address?: string
  contract_id?: string
  to?: string
}

interface MirrorNodeContractResultLogsResponse {
  timestamp?: string
  logs?: MirrorNodeContractResultLogResponse[]
}

interface MirrorNodeContractResultLogResponse {
  data: string
  topics: string[]
}

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name)
  private blockNumber: number

  constructor(
    @Inject() private readonly mirrorNode: MirrorNodePort,
    @Inject() private readonly decodeEvent: DecodeEventPort,
  ) {
    this.blockNumber = +process.env.BLOCKCHAIN_LISTENER_BLOCK_NUMBER
  }

  async fetchEvents(): Promise<BlockchainEvent[]> {
    this.logger.log(
      `Polling started for ${process.env.BLOCKCHAIN_LISTENER_NETWORK ?? "testnet"} and block ${this.blockNumber}`,
    )
    const events: BlockchainEvent[] = []

    try {
      const contractsResultsHashes = await this.getContractsResultsHashesContainingTrackedEvents()
      for (const hash of contractsResultsHashes) {
        const contractResults = await this.getContractResult(hash)
        events.push(
          ...contractResults.logs
            .map((log) =>
              this.decodeEvent.decode({
                ...log,
                transactionHash: hash,
                timestamp: contractResults.timestamp,
              }),
            )
            .filter((decoded): decoded is BlockchainEvent => decoded != null),
        )
      }
      ++this.blockNumber
      return events
    } catch (error) {
      this.logger.error(`Error fetching events from block ${this.blockNumber}: ${error}`)
    }
  }

  private async getContractsResultsHashesContainingTrackedEvents(): Promise<string[]> {
    const contractsResultsHashesList: string[] = []
    const query = this.blockNumber ? `?block.number=${this.blockNumber}&limit=100&order=asc` : ""

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const mirrorNodeContractsResultsResponse = (await this.mirrorNode.fetchData(
        `contracts/results${query}`,
        1,
      )) as MirrorNodeContractsResultsResponse

      const contractResultsHashes = this.getContractsResultsHashesFilteredByContract(
        mirrorNodeContractsResultsResponse.results,
      )

      contractsResultsHashesList.push(...contractResultsHashes)

      if (mirrorNodeContractsResultsResponse.links) {
        while (mirrorNodeContractsResultsResponse.links.next) {
          const nextUrl = new URL(mirrorNodeContractsResultsResponse.links.next)
          const relativePath = nextUrl.pathname + nextUrl.search
          const stripped = relativePath.replace(/^\/api\/v1\//, "")

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const mirrorNodeNextContractsResultsResponse = (await this.mirrorNode.fetchData(
            `${stripped}`,
            1,
          )) as MirrorNodeContractsResultsResponse
          const nextContractResultsHashes = this.getContractsResultsHashesFilteredByContract(
            mirrorNodeNextContractsResultsResponse.results,
          )
          contractsResultsHashesList.push(...nextContractResultsHashes)

          mirrorNodeContractsResultsResponse.links = mirrorNodeNextContractsResultsResponse.links
        }
      }

      return contractsResultsHashesList
    } catch (error) {
      this.logger.error(`Error getting contracts results hashes: ${error}`)
    }
  }

  private getContractsResultsHashesFilteredByContract(results: MirrorNodeContractResultResponse[]): string[] {
    return results
      .filter(
        (res) =>
          (res.address && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.address)) ||
          (res.to && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.to)),
      )
      .map((res) => res.hash)
      .filter((hash): hash is string => Boolean(hash))
  }

  private async getContractResult(hash: string): Promise<MirrorNodeContractResultLogsResponse> {
    try {
      return await this.mirrorNode.fetchData(`contracts/results/${hash}`, 1)
    } catch (error) {
      this.logger.error(`Error getting logs from block ${this.blockNumber}: ${error}`)
    }
  }
}
