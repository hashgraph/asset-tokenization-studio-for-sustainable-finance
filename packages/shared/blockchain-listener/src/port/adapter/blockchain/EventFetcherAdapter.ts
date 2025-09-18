// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort"
import { ConfigService } from "@nestjs/config"
import Event from '@domain/event/Event';
import BlockchainEvent from '@domain/blockchain/BlockchainEvent';
import EventFetcherPort from '@port/adapter/blockchain/EventFetcherPort';
import axios from "axios"
import { utils } from "ethers";
import { AccountId, EvmAddress } from "@hashgraph/sdk"

interface MirrorNodeResponse {
  logs_bloom?: string
}

interface BlockMirrorNodeResponse {
  logs_bloom?: string
}

interface MirrorNodeContractsResultsResponse {
  results?: MirrorNodeContractsAddressesResultsResponse[]
}

interface MirrorNodeContractsAddressesResultsResponse {
  address?: string,
  to?: string
}

interface AccountMirrorNodeResponse {
  account: string
}

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name);
  private readonly network: "testnet" | "previewnet" | "mainnet"
  private readonly maxRetries: number
  private readonly blockNumber: number
  private readonly contracts: string[]
  private readonly events: string[]
  private mirrorNodeBaseUrl: string

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.network = configService.get("BLOCKCHAIN_LISTENER_NETWORK") ?? "testnet"
    this.mirrorNodeBaseUrl = this.getMirrorNodeBaseUrl(this.network)
    this.maxRetries = configService.get("BLOCKCHAIN_LISTENER_MAX_RETRIES") ?? 1
    this.blockNumber = configService.get("BLOCKCHAIN_LISTENER_BLOCK_NUMBER") ?? 0
    this.contracts = this.getArrayFromConfig("BLOCKCHAIN_LISTENER_CONTRACTS")
    this.events = this.getArrayFromConfig("BLOCKCHAIN_LISTENER_EVENTS")
  }

  async fetchEvents(
  ): Promise<Event[]> {
      this.logger.log(`Polling started for ${this.network} and block ${this.blockNumber}`);
      try {
        if (await this.blockContainsTrackedEvents()) {
          const transactionsIds = await this.getTransactionsIdsContainingTrackedEvents()

          this.logger.debug(`Block ${this.blockNumber} contains tracked events`)
          const events: Event[] = []
          /*for (const log of logs) {
            const event = this.decodeLog(log)
            if (event) {
              events.push(event)
            }
          }*/
          this.logger.debug(`Fetched blockchain events ${events.length} for block: ${this.blockNumber}`)
          return events
        } else {
          this.logger.debug(`No tracked events where found in block ${this.blockNumber}`)
          return []
        }
      } catch (error) {
        console.log("ERROR");
        //throw new BlockchainEventListenerError("Error listening events", error)
      }
  }

  async getEvmAddressFromHedera(hederaAddress: string): Promise<string> {
    const input = hederaAddress.trim().toLowerCase()
    const id = AccountId.fromString(input)
    return `0x${id.toSolidityAddress()}`
  }

  async getHederaAddressFromEvm(evmAddress: string): Promise<string> {
    const input = evmAddress.trim().toLowerCase()
    const evmAddressWithPrefix = input.startsWith("0x") ? input : `0x${input}`
    if (this.isLongZeroAddress(evmAddressWithPrefix)) {
      return AccountId.fromEvmAddress(0, 0, evmAddressWithPrefix).toString()
    }
    return ((await this.fetchData(`accounts/${evmAddressWithPrefix}`)) as AccountMirrorNodeResponse).account
  }

  private getArrayFromConfig(key: string): string[] {
    return (this.configService.get<string>(key) ?? "").split(",").map(c => c.trim()).filter(c => c.length > 0)
  }

  private getMirrorNodeBaseUrl(network: string): string {
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

  private async blockContainsTrackedEvents() : Promise<boolean> {
    const blockLogsBloom = ((await this.fetchData(`blocks/${this.blockNumber}`)) as BlockMirrorNodeResponse).logs_bloom
    //const blockLogsBloom = await this.retrieveBlockLogsBloomInfoFromMirrorNode()
    //return this.anyAddrInBloom(blockLogsBloom) && this.anyLogInBloom(blockLogsBloom)
    return true;
  }

  /*private async retrieveBlockLogsBloomInfoFromMirrorNode(): Promise<string> {
    try {
      const url = `${this.mirrorNodeBaseUrl}/api/v1/blocks/${this.blockNumber}`
      this.logger.verbose(`Retrieving block info from Mirror Node: "${url}"`)
      const { data }: { data: MirrorNodeBlockResponse } = await axios.get(url)
      return data.logs_bloom || null
    } catch (error) {
      console.log("ERROR");
      return null;
    }
  }*/

  private async anyAddrInBloom(bloomHex: string) : Promise<boolean> {
    for (const contract of this.contracts) {
      const contractAddress = "0xa2aa501b19aff244d90cc15a4cf739d2725b5729"
      if (this.isInBloom(bloomHex, contractAddress)) {
        return true
      }
    }
    return false
  }

  private async anyLogInBloom(bloomHex: string) : Promise<boolean> {
    for (const event of this.events) {
      const eventSignature = "Transfer(address,address,uint256)";
      if (this.isInBloom(bloomHex, eventSignature, true)) {
        return true
      }
    }
    return false
  }

  private async getTransactionsIdsContainingTrackedEvents(): Promise<string[]> {
    return await this.retrieveContractsResultsByBlockNumberFromMirrorNode()
  }

  private async retrieveContractsResultsByBlockNumberFromMirrorNode(): Promise<string[]> {
    try {
      const query = this.blockNumber ? `?block.number=${this.blockNumber}limit=100&order=asc` : ""
      const url = `${this.mirrorNodeBaseUrl}/api/v1/contracts/results${query}`
      this.logger.verbose(`Retrieving contracts results from Mirror Node: "${url}"`)
      const { data }: { data: MirrorNodeContractsResultsResponse } = await axios.get(url)

      return data.results?.flatMap(r =>
        [r.address, r.to].filter((v): v is string => !!v)
      ) ?? [];
    } catch (error) {
      console.log("ERROR");
      return null;
    }
  }

  private isInBloom(bloomHex: string, value: string, isTopic = false): boolean {
    const bloomBytes = utils.arrayify(bloomHex);
    if (bloomBytes.length !== 256) {
      throw new Error(`Bloom length ${bloomBytes.length}, expected 256 bytes`);
    }

    let data: Uint8Array;

    if (isTopic) {
      data = utils.arrayify(utils.keccak256(utils.toUtf8Bytes(value)));
    } else {
      data = utils.zeroPad(utils.arrayify(value), 32);
    }

    for (let i = 0; i < 3; i++) {
      const bitpos = ((data[2 * i] << 8) | data[2 * i + 1]) & 0x7ff;

      const byteIndex = 256 - 1 - Math.floor(bitpos / 8);
      const bitInByte = bitpos % 8;
      const mask = 1 << bitInByte;

      if ((bloomBytes[byteIndex] & mask) === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Fetches data from Mirror Node with retry logic and timeout
   */
  private async fetchData<T>(path: string): Promise<T> {
    const url = `${this.mirrorNodeBaseUrl}/api/v1/${path}`

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Fetching data from: ${url} (attempt ${attempt})`)

        const { data } = await axios.get(url, { timeout: 5000 })

        this.logger.debug(`Successfully fetched data for ${url}`)
        return data
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries

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

    throw new Error("All retry attempts failed")
  }

  private isLongZeroAddress(address: string) {
    const addressBytes = EvmAddress.fromString(address).toBytes()
    for (let i = 0; i < 12; i++) {
      if (addressBytes[i] != 0) {
        return false
      }
    }
    return true
  }
}
