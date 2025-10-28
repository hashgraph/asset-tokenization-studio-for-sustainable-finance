// SPDX-License-Identifier: Apache-2.0

import { Client } from "@hashgraph/sdk"
import { ethers } from "ethers"

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

const ethereumProviderMap: Record<Environment, () => ethers.providers.JsonRpcProvider> = {
  testnet: () => new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api"),
  previewnet: () => new ethers.providers.JsonRpcProvider("https://previewnet.hashio.io/api"),
  mainnet: () => new ethers.providers.JsonRpcProvider("https://mainnet.hashio.io/api"),
  local: () => new ethers.providers.JsonRpcProvider("http://localhost:8545"),
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

export const getEthereumProvider = (environment: Environment): ethers.providers.JsonRpcProvider => {
  const factory = ethereumProviderMap[environment]
  if (!factory) {
    throw new Error(`Unsupported network environment: ${environment}`)
  }
  return factory()
}
