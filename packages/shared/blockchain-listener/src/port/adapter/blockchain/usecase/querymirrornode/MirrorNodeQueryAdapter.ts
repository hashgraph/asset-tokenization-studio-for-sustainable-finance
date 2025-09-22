// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import MirrorNodePort from "./MirrorNodePort"
import axios from "axios"

@Singleton()
export default class MirrorNodeQuery implements MirrorNodePort {
  private readonly logger = new Logger(MirrorNodeQuery.name)
  private mirrorNodeBaseUrl: string

  constructor() {
    this.mirrorNodeBaseUrl = this.getMirrorNodeBaseUrl(process.env.BLOCKCHAIN_LISTENER_NETWORK ?? "testnet")
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

  async fetchData<T>(path: string, maxRetries: number = 1): Promise<T> {
    const url = `${this.mirrorNodeBaseUrl}/api/v1/${path}`

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
