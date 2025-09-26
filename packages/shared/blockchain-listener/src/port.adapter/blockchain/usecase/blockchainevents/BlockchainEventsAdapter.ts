// SPDX-License-Identifier: Apache-2.0
import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import axios from "axios"
import BlockchainEventsPort from "./BlockchainEventsPort"
import GetBlockRequest from "./requests/GetBlockRequest"
import GetBlockResponse from "./responses/GetBlockResponse"
import GetContractsResultsByBlockNumberRequest from "./requests/GetContractsResultsByBlockNumberRequest"
import GetContractsResultsByBlockNumberResponse from "./responses/GetContractsResultsByBlockNumberResponse"
import GetNextContractsResultsByBlockNumberRequest from "./requests/GetNextContractsResultsByBlockNumberRequest"
import GetNextContractsResultsByBlockNumberResponse from "./responses/GetNextContractsResultsByBlockNumberResponse"
import GetContractsResultsByBlockHashRequest from "./requests/GetContractsResultsByBlockHashRequest"
import GetContractsResultsByBlockHashResponse from "./responses/GetContractsResultsByBlockHashResponse"

@Singleton()
export default class BlockchainEventsAdapter implements BlockchainEventsPort {
  private readonly logger = new Logger(BlockchainEventsAdapter.name)
  private readonly blockchainBaseUrl: string

  constructor() {
    this.blockchainBaseUrl = this.getBlockchainBaseUrl(process.env.BLOCKCHAIN_LISTENER_NETWORK ?? "testnet")
  }

  async getBlock(request: GetBlockRequest): Promise<GetBlockResponse> {
    try {
      return await this.fetchData(`blocks/${request.blockNumber}`, 1)
    } catch (error) {
      this.logger.error(`Error getting block ${request.blockNumber}: ${error}`)
    }
  }

  async getContractsResultsByBlockNumber(
    request: GetContractsResultsByBlockNumberRequest,
  ): Promise<GetContractsResultsByBlockNumberResponse> {
    try {
      const query = `?block.number=${request.blockNumber}&limit=100&order=asc`
      return await this.fetchData(`contracts/results${query}`, 1)
    } catch (error) {
      this.logger.error(`Error getting contracts results from block number ${request.blockNumber}: ${error}`)
    }
  }

  async getNextContractsResultsByBlockNumber(
    request: GetNextContractsResultsByBlockNumberRequest,
  ): Promise<GetNextContractsResultsByBlockNumberResponse> {
    try {
      return await this.fetchData(`contracts/results${request.query}`, 1)
    } catch (error) {
      this.logger.error(`Error getting next contracts results from block number ${request.query}: ${error}`)
    }
  }

  async getContractsResultsByBlockHash(
    request: GetContractsResultsByBlockHashRequest,
  ): Promise<GetContractsResultsByBlockHashResponse> {
    try {
      return await this.fetchData(`contracts/results/${request.blockHash}`, 1)
    } catch (error) {
      this.logger.error(`Error getting contracts results from block hash ${request.blockHash}: ${error}`)
    }
  }

  private getBlockchainBaseUrl(network: string): string {
    switch (network) {
      case "mainnet":
        return "https://mainnet-public.mirrornode.hedera.com"
      case "previewnet":
        return "https://previewnet.mirrornode.hedera.com"
      case "testnet":
        return "https://testnet.mirrornode.hedera.com"
      default:
        throw new Error(`Unsupported network: ${network}`)
    }
  }

  private async fetchData<T>(path: string, maxRetries: number = 1): Promise<T> {
    const url = `${this.blockchainBaseUrl}/api/v1/${path}`

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Fetching data from: ${url} (attempt ${attempt})`)

        const { data } = await axios.get(url, { timeout: 9000 })

        this.logger.debug(`Successfully fetched data for ${url}`)
        return data
      } catch (error) {
        const isLastAttempt = attempt === maxRetries

        if (error.name === "AbortError") {
          this.logger.warn(`Request timeout for ${url} (attempt ${attempt})`)
        } else {
          this.logger.warn(`Request failed for ${url} (attempt ${attempt}): ${error.message}`)
        }

        if (isLastAttempt) {
          throw error
        }

        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error(`All retry attempts failed when fetching ${url}`)
  }
}
