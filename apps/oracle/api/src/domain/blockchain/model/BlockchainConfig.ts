// SPDX-License-Identifier: Apache-2.0

/**
 * BlockchainConfig Entity
 * Global configuration for blockchain connection (non-sensitive values only)
 *
 * Note: PRIVATE_KEY and ACCOUNT_ID are kept in environment variables for security
 */
export class BlockchainConfig {
  constructor(
    public readonly id: string,
    public network: string,
    public rpcEndpoint: string,
    public useJsonRpc: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  updateNetwork(network: string): void {
    this.network = network
    this.updatedAt = new Date()
  }

  updateRpcEndpoint(rpcEndpoint: string): void {
    this.rpcEndpoint = rpcEndpoint
    this.updatedAt = new Date()
  }

  updateUseJsonRpc(useJsonRpc: boolean): void {
    this.useJsonRpc = useJsonRpc
    this.updatedAt = new Date()
  }

  update(network?: string, rpcEndpoint?: string, useJsonRpc?: boolean): void {
    if (network !== undefined) {
      this.network = network
    }
    if (rpcEndpoint !== undefined) {
      this.rpcEndpoint = rpcEndpoint
    }
    if (useJsonRpc !== undefined) {
      this.useJsonRpc = useJsonRpc
    }
    this.updatedAt = new Date()
  }
}
