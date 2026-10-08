// SPDX-License-Identifier: Apache-2.0

import { Client } from "@hiero-ledger/sdk"
import { JsonRpcProvider } from "ethers"

export type Environment = "testnet" | "previewnet" | "mainnet" | "local"

const HederaNetworks = [
  { network: "testnet", chainId: 296 },
  { network: "previewnet", chainId: 297 },
  { network: "mainnet", chainId: 295 },
  { network: "local", chainId: 298 },
] as const

const networkMap = new Map(HederaNetworks.map((net) => [net.network, net.chainId]))

const hederaClientMap: Record<Environment, () => Client> = {
  testnet: () => Client.forTestnet(),
  previewnet: () => Client.forPreviewnet(),
  mainnet: () => Client.forMainnet(),
  local: () => Client.forNetwork({}),
}

const ethereumProviderMap: Record<Environment, () => JsonRpcProvider> = {
  testnet: () => new JsonRpcProvider("https://testnet.hashio.io/api"),
  previewnet: () => new JsonRpcProvider("https://previewnet.hashio.io/api"),
  mainnet: () => new JsonRpcProvider("https://mainnet.hashio.io/api"),
  local: () => new JsonRpcProvider("http://localhost:8545"),
}

export const getChainIdByNetwork = (environment: Environment): number => {
  const chainId = networkMap.get(environment)
  if (!chainId) {
    throw new Error(`Unsupported network environment: ${environment}`)
  }
  return chainId
}

export const getHederaClient = (environment: Environment): Client => {
  const factory = hederaClientMap[environment]
  if (!factory) {
    throw new Error(`Unsupported network environment: ${environment}`)
  }
  return factory()
}

export const getEthereumProvider = (environment: Environment): JsonRpcProvider => {
  const factory = ethereumProviderMap[environment]
  if (!factory) {
    throw new Error(`Unsupported network environment: ${environment}`)
  }
  return factory()
}
