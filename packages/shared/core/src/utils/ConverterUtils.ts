// SPDX-License-Identifier: Apache-2.0

import { AccountId, EvmAddress, AccountInfo } from "@hashgraph/sdk"
import axios, { HttpStatusCode } from "axios"
import { Retryable } from "../decorators/Retryable"

export class ConverterUtils {
  private constructor() {}

  @Retryable()
  static async getHederaAddressFromEvm(evmAddress: string): Promise<string> {
    const input = evmAddress.trim().toLowerCase()
    const evmAddressWithPrefix = input.startsWith("0x") ? input : `0x${input}`
    if (ConverterUtils.isLongZeroAddress(evmAddressWithPrefix)) {
      return AccountId.fromEvmAddress(0, 0, evmAddressWithPrefix).toString()
    }
    return ((await this.fetchData(`accounts/${evmAddressWithPrefix}`)) as any).account
  }

  @Retryable()
  static async getEvmAddressFromHederaAddress(hederaAddress: string): Promise<string> {
    try {
      const data = await this.fetchData<AccountInfo>(`accounts/${hederaAddress}`)
      return data["evm_address"]
    } catch (error) {
      if (error?.status !== HttpStatusCode.NotFound) {
        throw error
      }
    }
    return `0x${AccountId.fromString(hederaAddress).toEvmAddress()}`
  }

  static formatNumber(value: string, decimals: number) {
    const position = value.length - decimals
    const decimalPart = value.slice(position).replace(/0+$/, "")
    return `${value.slice(0, position) || "0"}${decimalPart ? "." + decimalPart : ""}`
  }

  private static isLongZeroAddress(address: string) {
    const addressBytes = EvmAddress.fromString(address).toBytes()
    for (let i = 0; i < 12; i++) {
      if (addressBytes[i] != 0) {
        return false
      }
    }
    return true
  }

  private static async fetchData<T>(path: string): Promise<T> {
    const url = `${ConverterUtils.getMirrorNodeURL()}/api/v1/${path}`
    const { data } = await axios.get(url)
    return data
  }

  private static getMirrorNodeURL(): string {
    const network = process.env.HEDERA_NETWORK ?? "testnet"
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
}
