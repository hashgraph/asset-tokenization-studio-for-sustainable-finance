// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort"
import { ConfigService } from "@nestjs/config"
import Event from '@domain/event/Event';
import BlockchainEvent from '@domain/blockchain/BlockchainEvent';
import EventFetcherPort from '@port/adapter/blockchain/EventFetcherPort';
import axios from "axios"
import { utils } from "ethers";
import { Interface } from "ethers/lib/utils"
import { AccountId, EvmAddress } from "@hashgraph/sdk"

interface MirrorNodeResponse {
  logs_bloom?: string
}

interface BlockMirrorNodeResponse {
  logs_bloom?: string
}

interface MirrorNodeContractsResultsResponse {
  results?: MirrorNodeContractResultResponse[],
  links?: MirrorNodeContractsResultsResponseLinks
}

interface MirrorNodeContractsResultsResponseLinks {
  next?: string
}

interface MirrorNodeContractResultResponse {
  hash?: string,
  address?: string,
  contract_id?: string,
  to?: string
}

interface MirrorNodeContractResultLogsResponse {
  timestamp?: string,
  logs?: MirrorNodeContractResultLogResponse[]
}

interface MirrorNodeContractResultLogResponse {
  address?: string,
  bloom?: string,
  data?: string,
  index: number,
  topics?: string[]
}

interface AccountMirrorNodeResponse {
  account: string,
  evm_address: string
}

@Singleton()
export default class EventFetcherAdapter implements EventFetcherPort {
  private readonly logger = new Logger(EventFetcherAdapter.name);
  private readonly network: "testnet" | "previewnet" | "mainnet"
  private readonly maxRetries: number
  private readonly blockNumber: number
  private readonly contracts_hedera_id: string[]
  private readonly events: string[]
  private contracts_evm_address: string[]
  private mirrorNodeBaseUrl: string

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.network = configService.get("BLOCKCHAIN_LISTENER_NETWORK") ?? "testnet"
    this.mirrorNodeBaseUrl = this.getMirrorNodeBaseUrl(this.network)
    this.maxRetries = configService.get("BLOCKCHAIN_LISTENER_MAX_RETRIES") ?? 1
    this.blockNumber = configService.get("BLOCKCHAIN_LISTENER_BLOCK_NUMBER") ?? 0
    this.contracts_hedera_id = this.getArrayFromConfig("BLOCKCHAIN_LISTENER_CONTRACTS")
    this.events = this.getArrayFromConfig("BLOCKCHAIN_LISTENER_EVENTS")
  }

  async fetchEvents(
  ): Promise<Event[]> {
      this.logger.log(`Polling started for ${this.network} and block ${this.blockNumber}`);
      const events: Event[] = []

      if (this.contracts_hedera_id && !this.contracts_evm_address) {
        this.contracts_evm_address = await Promise.all(
          this.contracts_hedera_id.map(id => this.getEvmAddressFromHederaId(id))
        );
      }

      try {
        if (await this.blockContainsTrackedEvents()) {
          this.logger.debug(`Block ${this.blockNumber} contains tracked events`)

          const contractsResultsHashes = await this.getContractsResultsHashesContainingTrackedEvents()
          for (const hash of contractsResultsHashes) {
            const contractResults = await this.getContractResult(hash)
            /*events.push(
              ...await Promise.all(contractResults.logs.map(log => this.decodeLog(log, contractResults.timestamp)))
            )*/
          }
          return events
        } else {
          this.logger.debug(`No tracked events where found in block ${this.blockNumber}`)
          return []
        }
      } catch (error) {
        console.log("ERROR");
      }
  }

  async getEvmAddressFromHederaId(hederaId: string): Promise<string> {
    return ((await this.fetchData(`accounts/${hederaId}`)) as AccountMirrorNodeResponse).evm_address
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
    //return this.anyAddrInBloom(blockLogsBloom) && this.anyLogInBloom(blockLogsBloom)
    return true;
  }

  private async anyAddrInBloom(bloomHex: string) : Promise<boolean> {
    for (const contract of this.contracts_hedera_id) {
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

  private async getContractsResultsHashesContainingTrackedEvents(): Promise<string[]> {
    const contractsResultsHashesList: string[] = []
    const query = this.blockNumber ? `?block.number=${this.blockNumber}&limit=100&order=asc` : ""
    const mirrorNodeContractsResultsResponse = ((await this.fetchData(`contracts/results${query}`)) as MirrorNodeContractsResultsResponse)

    const contractResultsHashes = this.getContractsResultsHashesFilteredByContract(mirrorNodeContractsResultsResponse.results)
    contractsResultsHashesList.push(...contractResultsHashes)

    if (mirrorNodeContractsResultsResponse.links) {
       while (mirrorNodeContractsResultsResponse.links.next) {
         const nextUrl = new URL(mirrorNodeContractsResultsResponse.links.next);
         const relativePath = nextUrl.pathname + nextUrl.search;
         const stripped = relativePath.replace(/^\/api\/v1\//, "");
         const mirrorNodeNextContractsResultsResponse = ((await this.fetchData(`${stripped}`)) as MirrorNodeContractsResultsResponse)
         const nextContractResultsHashes = this.getContractsResultsHashesFilteredByContract(mirrorNodeNextContractsResultsResponse.results)
         contractsResultsHashesList.push(...nextContractResultsHashes)

         mirrorNodeContractsResultsResponse.links = mirrorNodeNextContractsResultsResponse.links
       }
    }

    return contractsResultsHashesList
  }

  private getContractsResultsHashesFilteredByContract(results: MirrorNodeContractResultResponse[]): string[] {
    return results.filter(
      (res) =>
        (res.address && this.contracts_evm_address.includes(res.address)) ||
        (res.to && this.contracts_evm_address.includes(res.to)) ||
        (res.contract_id && this.contracts_hedera_id.includes(res.contract_id)),
      ).map((res) => res.hash!).filter((hash): hash is string => Boolean(hash))
  }

  private async getContractResult(hash: string): Promise<MirrorNodeContractResultLogsResponse> {
    return ((await this.fetchData(`contracts/results/${hash}`)) as MirrorNodeContractResultLogsResponse)
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
