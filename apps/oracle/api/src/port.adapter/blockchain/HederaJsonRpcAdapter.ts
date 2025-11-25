// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BlockchainPort, WriteKpiResult } from "@domain/oracle/ports/BlockchainPort"
import type { BlockchainConfigRepository } from "@domain/blockchain/repositories/BlockchainConfigRepository"

@Injectable()
export class HederaJsonRpcAdapter implements BlockchainPort {
  private readonly logger = new Logger(HederaJsonRpcAdapter.name)

  constructor(
    @Inject("BlockchainConfigRepository")
    private readonly configRepository: BlockchainConfigRepository,
  ) {}

  /**
   * Get credentials from env vars (security - never from DB)
   */
  private getCredentials(): { privateKey: string; accountId: string } {
    const privateKey = process.env.PRIVATE_KEY || ""
    const accountId = process.env.ACCOUNT_ID || ""

    if (!privateKey || !accountId) {
      throw new Error("PRIVATE_KEY and ACCOUNT_ID must be set in environment variables")
    }

    return { privateKey, accountId }
  }

  async writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    toDate: Date,
  ): Promise<WriteKpiResult> {
    this.logger.log(
      `Writing KPI to contract ${kpiContractId} for project ${projectId}: ` +
        `value=${kpiValue}, date=${toDate.toISOString()} (via JSON-RPC)`,
    )

    try {
      // Get config from DB and credentials from env vars
      const config = await this.configRepository.getOrCreateDefault()
      const { accountId } = this.getCredentials()

      if (!config.rpcEndpoint) {
        throw new Error("RPC endpoint not configured")
      }

      // Encode function call
      // Contract function signature: addKpiData(uint256 toDate, uint256 kpiValue)
      // Note: Only ONE timestamp is sent (toDate), not a range
      const functionSelector = this.getFunctionSelector("addKpiData(uint256,uint256)")
      const encodedParams = this.encodeParameters(
        Math.floor(toDate.getTime() / 1000),
        Math.floor(kpiValue * 1000000),
      )

      const callData = functionSelector + encodedParams

      // Build JSON-RPC request
      const request = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "eth_sendRawTransaction",
        params: [
          {
            from: accountId,
            to: kpiContractId,
            data: callData,
            gas: "0x7A120", // 500000 in hex
          },
        ],
      }

      const response = await fetch(config.rpcEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(`RPC error: ${result.error.message}`)
      }

      const transactionHash = result.result

      this.logger.log(`Successfully wrote KPI to contract via JSON-RPC. TX: ${transactionHash}`)

      return {
        transactionHash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Failed to write KPI via JSON-RPC: ${error instanceof Error ? error.message : "Unknown error"}`)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getFunctionSelector(_signature: string): string {
    // Simple implementation - in production, use proper keccak256 hashing
    // This is a placeholder
    return "0x12345678" // First 4 bytes of keccak256(signature)
  }

  private encodeParameters(toTimestamp: number, kpiValue: number): string {
    // Simplified encoding - in production, use ethers.js AbiCoder
    // Parameters: uint256 toDate, uint256 kpiValue
    return (
      "0x" +
      toTimestamp.toString(16).padStart(64, "0") +
      kpiValue.toString(16).padStart(64, "0")
    )
  }
}
