import { AccountId, EvmAddress } from "@hashgraph/sdk"
import axios from "axios"
import { Retryable } from "../decorators/Retryable"

export class ConverterUtils {
  private constructor() {}

  static async getHederaAddressFromEvm(evmAddress: string): Promise<string> {
    const input = evmAddress.trim().toLowerCase()
    const evmAddressWithPrefix = input.startsWith("0x") ? input : `0x${input}`
    if (ConverterUtils.isLongZeroAddress(evmAddressWithPrefix)) {
      return AccountId.fromEvmAddress(0, 0, evmAddressWithPrefix).toString()
    }
    return ((await ConverterUtils.fetchData(`accounts/${evmAddressWithPrefix}`)) as any).account
  }

  static formatNumber(value: string, decimals: number) {
    const position = value.length - decimals
    return `${value.slice(0, position)}.${value.slice(position).replace(/0+$/, "")}`
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

  @Retryable()
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
