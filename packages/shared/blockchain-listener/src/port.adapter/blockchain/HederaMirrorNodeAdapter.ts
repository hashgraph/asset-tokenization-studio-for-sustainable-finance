// SPDX-License-Identifier: Apache-2.0

import { HederaPort } from "@port/blockchain/HederaPort"
import { Logger, Retryable, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { BlockchainEvent } from "@port/blockchain/model/BlockchainEvent"
import axios, { HttpStatusCode } from "axios"
import { FetchEventsRequest } from "@port/blockchain/model/FetchEventsRequest"
import { EventSignatureRequest } from "@port/blockchain/model/EventSignatureRequest"
import { isTopicInBloom } from "ethereum-bloom-filters"
import { utils } from "ethers"
import { GetBlockResponse } from "@port/blockchain/model/GetBlockResponse"
import { Interface } from "ethers/lib/utils"
import DecodeLogRequest from "@port/blockchain/model/DecodeLogRequest"
import { GetBlockRequest } from "@port/blockchain/model/GetBlockRequest"
import { BigNumber } from "ethers"

@Singleton()
export class HederaMirrorNodeAdapter implements HederaPort {
  private readonly INDEXED_PARAMS_PATTERN = /\s*indexed*/g
  private readonly EVENT_NAME_PATTERN = /^([^(]+)\((.*)\)$/

  private readonly mirrorNodeURL: string
  private readonly logger = new Logger("HederaMirrorNodeAdapter")

  constructor() {
    this.mirrorNodeURL = this.getMirrorNodeURL(process.env.HEDERA_NETWORK ?? "testnet")
  }

  @Validate()
  async getBlock(getBlockRequest: GetBlockRequest): Promise<GetBlockResponse> {
    try {
      const block = await this.fetchData(`blocks/${getBlockRequest.blockNumber}`)
      const logsBloom = (block as any)?.logs_bloom
      if (logsBloom) {
        return {
          logsBloom,
        } as GetBlockResponse
      }
    } catch (error) {
      if (error?.status !== HttpStatusCode.NotFound) {
        throw error
      }
    }
    return null // Block not found
  }

  @Retryable()
  async getLastBlockNumber(): Promise<number> {
    const getLastBlockResponse: GetLastBlocksResponse = await this.fetchData("blocks?limit=1&order=desc")
    return getLastBlockResponse.blocks.length == 1 ? getLastBlockResponse.blocks[0].number : null
  }

  @Validate()
  async fetchEvents(request: FetchEventsRequest): Promise<BlockchainEvent[]> {
    const events: BlockchainEvent[] = []

    if (request.logsBloom === "0x") {
      return events
    }

    const eventSignatures = this.getEventSignaturesIncludedInBlock(request)
    if (!eventSignatures) {
      return events
    }

    const contractsResultsHashes = await this.getContractsResultsHashesContainingTrackedEvents(
      request.blockNumber,
      eventSignatures,
    )

    for (const blockHash of contractsResultsHashes) {
      const contractResults = await this.getContractsResultsByBlockHash({
        blockHash,
      })

      events.push(
        ...contractResults.logs
          .map((log) =>
            this.decodeLog({
              ...log,
              transactionHash: blockHash,
              timestamp: contractResults.timestamp,
              eventSignatures,
              contractId: log.contract_id,
            }),
          )
          .filter((decoded): decoded is BlockchainEvent => decoded != null),
      )
    }
    return events
  }

  private getMirrorNodeURL(network: string): string {
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

  private getEventSignaturesIncludedInBlock(request: FetchEventsRequest): EventSignatureRequest[] {
    const eventSignatures: EventSignatureRequest[] = []
    request.contractEvents.forEach((contractEvent) => {
      const normalizedEventSignatureHash = utils.id(this.normalizeEventSignature(contractEvent.eventSignature))
      if (isTopicInBloom(request.logsBloom, normalizedEventSignatureHash)) {
        eventSignatures.push({
          contractAddress: contractEvent.contractAddress,
          eventSignature: contractEvent.eventSignature,
          normalizedEventSignatureHash,
        } as EventSignatureRequest)
      }
    })
    return eventSignatures
  }

  private async fetchData<T>(path: string): Promise<T> {
    const url = `${this.mirrorNodeURL}/api/v1/${path}`
    const { data } = await axios.get(url, { timeout: 9000 })

    return data
  }

  private async getContractsResultsHashesContainingTrackedEvents(
    blockNumber: number,
    eventSignatures: EventSignatureRequest[],
  ): Promise<string[]> {
    const contractsResultsHashesList: string[] = []

    const contractsResultsByBlockNumber = await this.getContractsResultsByBlockNumber({
      blockNumber,
    })

    const contractAddresses = eventSignatures.map((eventSignature) => eventSignature.contractAddress.toLowerCase())
    const contractResultsHashes = this.getContractsResultsHashesFilteredByContract(
      contractsResultsByBlockNumber.results,
      contractAddresses,
    )

    contractsResultsHashesList.push(...contractResultsHashes)

    if (contractsResultsByBlockNumber.links) {
      while (contractsResultsByBlockNumber.links.next) {
        const nextUrl = new URL(contractsResultsByBlockNumber.links.next)
        const relativePath = nextUrl.pathname + nextUrl.search
        const query = relativePath.replace(/^\/api\/v1\//, "")

        const contractsResultsByNextBlockNumber = await this.getNextContractsResultsByBlockNumber({
          query,
        })
        const nextContractResultsHashes = this.getContractsResultsHashesFilteredByContract(
          contractsResultsByNextBlockNumber.results,
          contractAddresses,
        )
        contractsResultsHashesList.push(...nextContractResultsHashes)

        contractsResultsByBlockNumber.links = contractsResultsByNextBlockNumber.links
      }
    }

    return contractsResultsHashesList
  }

  private getContractsResultsHashesFilteredByContract(
    results: GetContractsResultsResultsByBlockNumberResponse[],
    contractAddresses: string[],
  ): string[] {
    return results
      .filter(
        (res) =>
          (res.address && contractAddresses.includes(res.address)) || (res.to && contractAddresses.includes(res.to)),
      )
      .map((res) => res.hash)
      .filter((hash): hash is string => Boolean(hash))
  }

  @Retryable()
  private async getContractsResultsByBlockHash(
    request: GetContractsResultsByBlockHashRequest,
  ): Promise<GetContractsResultsByBlockHashResponse> {
    return await this.fetchData(`contracts/results/${request.blockHash}`)
  }

  @Retryable()
  private async getContractsResultsByBlockNumber(
    request: GetContractsResultsByBlockNumberRequest,
  ): Promise<GetContractsResultsByBlockNumberResponse> {
    const query = `?block.number=${request.blockNumber}&limit=100&order=asc`
    return await this.fetchData(`contracts/results${query}`)
  }

  @Retryable()
  private async getNextContractsResultsByBlockNumber(
    request: GetNextContractsResultsByBlockNumberRequest,
  ): Promise<GetNextContractsResultsByBlockNumberResponse> {
    return await this.fetchData(`contracts/results${request.query}`)
  }

  private normalizeEventSignature(signature: string): string {
    const name = signature.substring(0, signature.indexOf("("))
    const params = signature.substring(signature.indexOf("(") + 1, signature.length - 1)
    const types = params
      .split(",")
      .map((p) => p.trim())
      .map((p) => p.replace(this.INDEXED_PARAMS_PATTERN, ""))
      .map((p) => this.removeParamsNames(p))
    return `${name}(${types.join(",")})`
  }

  private removeParamsNames(p: string): string {
    const param = p.split(" ")
    let result = param[0]
    for (let index = 1; index < param.length; index++) {
      if (param[index].indexOf(")") > -1) {
        const paramPossibleRest = param[index].substring(param[index].indexOf(")"))
        result = result + paramPossibleRest
      }
    }
    return result
  }

  private decodeLog(request: DecodeLogRequest): BlockchainEvent {
    try {
      const eventSignature: string = request.eventSignatures.find(
        (eventSignature) =>
          eventSignature.normalizedEventSignatureHash === request.topics[0] &&
          eventSignature.contractAddress.toLowerCase() === request.address.toLowerCase(),
      )?.eventSignature
      if (!eventSignature) {
        return null
      }
      const eventName: string = this.getEventName(eventSignature)
      const decodedValues = this.decodeEventParams(eventSignature, request.data, request.topics)
      const eventParamsObj = this.getEventParmsObject(decodedValues)

      const eventObj: BlockchainEvent = {
        logTimestamp: request.timestamp,
        transactionHash: request.transactionHash,
        name: eventName,
        signature: eventSignature,
        contractId: request.contractId,
      } as BlockchainEvent

      return { ...eventObj, ...eventParamsObj }
    } catch (error) {
      throw new Error(`Error decoding log ${error?.message}.\n${JSON.stringify(request, null, 2)}`)
    }
  }

  private getEventParmsObject(input: any): any {
    if (Array.isArray(input)) {
      const keys = Object.keys(input)
      const hasNamedKeys = keys.some((k) => isNaN(Number(k)))

      if (hasNamedKeys) {
        const namedProps: any = {}
        for (const key of keys) {
          if (isNaN(Number(key))) {
            const value = input[key]
            namedProps[key] = this.getEventParmsObject(value)
          }
        }
        return namedProps
      } else {
        return input.map((value) => this.getEventParmsObject(value))
      }
    } else if (typeof input === "object" && input !== null) {
      if (input.constructor.name == "BigNumber") {
        return input.toString()
      }
      if (input._isBigNumber && input._hex) {
        return BigNumber.from(input).toString()
      }

      const cleaned: any = {}
      for (const [key, value] of Object.entries(input)) {
        cleaned[key] = this.getEventParmsObject(value)
      }
      return cleaned
    }
    return input
  }

  private decodeEventParams(eventSignature: string, data: string, topics: string[]) {
    const iface = new Interface([`event ${eventSignature}`])
    const parsed = iface.parseLog({
      data: data,
      topics: topics,
    })
    return parsed.args
  }

  private getEventName(eventSignature: string): string {
    const match = eventSignature.match(this.EVENT_NAME_PATTERN)
    if (!match) {
      throw new Error("Invalid event signature: " + eventSignature)
    }
    return match[1]
  }
}

interface GetLastBlocksResponse {
  readonly blocks: GetLastBlockResponse[]
}

interface GetLastBlockResponse {
  readonly number: number
}

export interface GetContractsResultsByBlockHashResponse {
  readonly timestamp: string
  readonly logs: GetContractsResultsLogsByBlockHashResponse[]
}

interface GetContractsResultsLogsByBlockHashResponse {
  readonly data: string
  readonly topics: string[]
  readonly contract_id: string
  readonly address: string
}

interface GetContractsResultsByBlockHashRequest {
  readonly blockHash: string
}

interface GetContractsResultsByBlockNumberResponse {
  readonly results: GetContractsResultsResultsByBlockNumberResponse[]
  links: GetContractsResultsLinksByBlockNumberResponse
}

interface GetContractsResultsLinksByBlockNumberResponse {
  readonly next: string
}

interface GetContractsResultsResultsByBlockNumberResponse {
  readonly hash: string
  readonly address: string
  readonly contract_id: string
  readonly to: string
}

interface GetContractsResultsByBlockNumberRequest {
  readonly blockNumber: number
}

interface GetNextContractsResultsByBlockNumberRequest {
  readonly query: string
}

interface GetNextContractsResultsByBlockNumberResponse {
  readonly results: GetContractsResultsResultsByBlockNumberResponse[]
  readonly links: GetContractsResultsLinksByBlockNumberResponse
}
