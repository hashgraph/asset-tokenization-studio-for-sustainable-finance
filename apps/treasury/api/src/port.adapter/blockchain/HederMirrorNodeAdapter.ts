// SPDX-License-Identifier: Apache-2.0

import { HederaPort } from "@port/blockchain/HederaPort"
import axios from "axios"
import { ConverterUtils, Retryable, Singleton } from "@hashgraph/green-bonds-shared-core"

@Singleton()
export class HederMirrorNodeAdapter implements HederaPort {
  private readonly mirrorNodeURL: string

  constructor() {
    this.mirrorNodeURL = this.getMirrorNodeURL(process.env.HEDERA_NETWORK ?? "testnet")
  }

  @Retryable()
  async getTokenBalance(tokenId: string, accountId: string): Promise<string> {
    const balances = ((await this.fetchData(`tokens/${tokenId}/balances/?account.id=${accountId}`)) as any)?.balances
    if (balances && balances.length && balances[0].balance !== 0) {
      const { balance, decimals } = balances[0]
      return ConverterUtils.formatNumber(balance.toString(), decimals)
    }
    return "0"
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

  private async fetchData<T>(path: string): Promise<T> {
    const url = `${this.mirrorNodeURL}/api/v1/${path}`
    const { data } = await axios.get(url)
    return data
  }
}
