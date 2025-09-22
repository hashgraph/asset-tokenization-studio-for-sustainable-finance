// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger, Inject } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "./EventFetcherPort"
import type MirrorNodePort from "@port/blockchain/usecase/querymirrornode/MirrorNodePort"
import type DecodeEventPort from "@port/blockchain/usecase/decodeevent/DecodeEventPort"
import BlockchainEvent from "@domain/event/BlockchainEvent"
import {
  isBloom,
  isContractAddressInBloom,
} from 'ethereum-bloom-filters';

interface MirrorNodeResponse {
  logs_bloom?: string
}

interface BlockMirrorNodeResponse {
  logs_bloom?: string
}

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

interface AccountMirrorNodeResponse {
  account: string
  evm_address: string
}

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name)
  private blockNumber: number

  constructor(
    @Inject() private readonly mirrorNode: MirrorNodePort,
    @Inject() private readonly decodeEvent: DecodeEventPort
  ) {
    this.blockNumber = +process.env.BLOCKCHAIN_LISTENER_BLOCK_NUMBER
  }

  async fetchEvents(): Promise<BlockchainEvent[]> {
    this.logger.log(
      `Polling started for ${process.env.BLOCKCHAIN_LISTENER_NETWORK ?? "testnet"} and block ${this.blockNumber}`
    )
    const events: BlockchainEvent[] = []

    const contracts_hedera_id = (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",")
    try {
      if (await this.blockContainsTrackedEvents()) {
        this.logger.debug(`Block ${this.blockNumber} contains tracked events`)

        const contractsResultsHashes = await this.getContractsResultsHashesContainingTrackedEvents()
        for (const hash of contractsResultsHashes) {
          const contractResults = await this.getContractResult(hash)
          events.push(
            ...contractResults.logs
              .map(log =>
                this.decodeEvent.decode({
                  ...log,
                  timestamp: contractResults.timestamp,
                }),
              )
              .filter((decoded): decoded is BlockchainEvent => decoded != null)
          )
        }
        ++this.blockNumber
        return events
      } else {
        this.logger.debug(`No tracked events where found in block ${this.blockNumber}`)
        ++this.blockNumber
        return []
      }
    } catch (error) {
      this.logger.error(`Error fetching events from block ${this.blockNumber}`)
    }
  }

  private async blockContainsTrackedEvents(): Promise<boolean> {
    const blockLogsBloom = (
      await this.mirrorNode.fetchData(`blocks/${this.blockNumber}`, 1) as BlockMirrorNodeResponse
    ).logs_bloom
    //return anyAddrInBloom(blockLogsBloom) && anyLogInBloom(blockLogsBloom)

    return true
  }

  private async anyAddrInBloom(bloomHex: string): Promise<boolean> {
    const contracts = (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "")
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    return contracts.some(contract => isContractAddressInBloom(bloomHex, contract));
  }

  /*private async anyLogInBloom(bloomHex: string): Promise<boolean> {
    for (const event of (process.env.BLOCKCHAIN_LISTENER_EVENTS ?? "").split(",")) {
      const eventSignature = "Transfer(address,address,uint256)"
      if (this.isInBloom(bloomHex, eventSignature, true)) {
        return true
      }
    }
    return false
  }*/

  private async getContractsResultsHashesContainingTrackedEvents(): Promise<string[]> {
    const contractsResultsHashesList: string[] = []
    const query = this.blockNumber ? `?block.number=${this.blockNumber}&limit=100&order=asc` : ""

    try {
      const mirrorNodeContractsResultsResponse = ((
        await this.mirrorNode.fetchData(`contracts/results${query}`, 1)) as MirrorNodeContractsResultsResponse
      )

      const contractResultsHashes = this.getContractsResultsHashesFilteredByContract(
        mirrorNodeContractsResultsResponse.results
      )
      contractsResultsHashesList.push(...contractResultsHashes)

      if (mirrorNodeContractsResultsResponse.links) {
        while (mirrorNodeContractsResultsResponse.links.next) {
          const nextUrl = new URL(mirrorNodeContractsResultsResponse.links.next)
          const relativePath = nextUrl.pathname + nextUrl.search
          const stripped = relativePath.replace(/^\/api\/v1\//, "")
          const mirrorNodeNextContractsResultsResponse = ((
            await this.mirrorNode.fetchData(`${stripped}`, 1))as MirrorNodeContractsResultsResponse
          )
          const nextContractResultsHashes = this.getContractsResultsHashesFilteredByContract(
            mirrorNodeNextContractsResultsResponse.results
          )
          contractsResultsHashesList.push(...nextContractResultsHashes)

          mirrorNodeContractsResultsResponse.links = mirrorNodeNextContractsResultsResponse.links
        }
      }

      return contractsResultsHashesList

    } catch (error) {
      this.logger.error("Error getting contracts results hashes")
    }
  }

  private getContractsResultsHashesFilteredByContract(results: MirrorNodeContractResultResponse[]): string[] {
    return results
      .filter(
        (res) =>
          (res.address && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.address)) ||
          (res.to && (process.env.BLOCKCHAIN_LISTENER_CONTRACTS ?? "").split(",").includes(res.to))
      )
      .map((res) => res.hash)
      .filter((hash): hash is string => Boolean(hash))
  }

  private async getContractResult(hash: string): Promise<MirrorNodeContractResultLogsResponse> {
    try {
      return await this.mirrorNode.fetchData(`contracts/results/${hash}`, 1)
    } catch (error) {
      this.logger.error(`Error getting logs from block ${this.blockNumber}`)
    }
  }
}
