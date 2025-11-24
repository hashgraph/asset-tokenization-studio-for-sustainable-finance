// SPDX-License-Identifier: Apache-2.0
import { BlockchainConfig } from "@domain/blockchain/model/BlockchainConfig"

export class BlockchainConfigResponse {
  id: string
  network: string
  rpcEndpoint: string
  useJsonRpc: boolean
  createdAt: Date
  updatedAt: Date

  static fromDomain(config: BlockchainConfig): BlockchainConfigResponse {
    const response = new BlockchainConfigResponse()
    response.id = config.id
    response.network = config.network
    response.rpcEndpoint = config.rpcEndpoint
    response.useJsonRpc = config.useJsonRpc
    response.createdAt = config.createdAt
    response.updatedAt = config.updatedAt
    return response
  }
}
