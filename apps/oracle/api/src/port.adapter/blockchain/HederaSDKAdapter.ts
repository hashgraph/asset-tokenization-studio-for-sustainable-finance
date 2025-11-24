// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BlockchainPort, WriteKpiResult } from "@domain/oracle/ports/BlockchainPort"
import type { BlockchainConfigRepository } from "@domain/blockchain/repositories/BlockchainConfigRepository"
import { Client, PrivateKey, AccountId, ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk"

@Injectable()
export class HederaSDKAdapter implements BlockchainPort {
  private readonly logger = new Logger(HederaSDKAdapter.name)
  private client: Client | null = null
  private operatorAccountId: AccountId | null = null
  private operatorPrivateKey: PrivateKey | null = null
  private currentNetwork: string | null = null

  constructor(
    @Inject("BlockchainConfigRepository")
    private readonly configRepository: BlockchainConfigRepository,
  ) {}

  /**
   * Lazy initialization of Hedera client
   * Network is read from DB config, credentials from env vars (security)
   */
  private async ensureClient(): Promise<Client> {
    const config = await this.configRepository.getOrCreateDefault()

    // Reinitialize client if network changed
    if (this.client && this.currentNetwork === config.network) {
      return this.client
    }

    // Close existing client if network changed
    if (this.client) {
      this.client.close()
      this.logger.log(`Reinitializing client due to network change: ${this.currentNetwork} -> ${config.network}`)
    }

    // Get credentials from env vars (never from DB for security)
    const accountIdStr = process.env.ACCOUNT_ID || ""
    const privateKeyStr = process.env.PRIVATE_KEY || ""

    if (!accountIdStr || !privateKeyStr) {
      throw new Error("ACCOUNT_ID and PRIVATE_KEY must be set in environment variables")
    }

    this.operatorAccountId = AccountId.fromString(accountIdStr)
    this.operatorPrivateKey = PrivateKey.fromStringED25519(privateKeyStr)

    // Initialize client based on network from DB config
    if (config.network === "mainnet") {
      this.client = Client.forMainnet()
    } else if (config.network === "previewnet") {
      this.client = Client.forPreviewnet()
    } else {
      this.client = Client.forTestnet()
    }

    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey)
    this.currentNetwork = config.network

    this.logger.log(`HederaSDKAdapter initialized for ${config.network} with account ${accountIdStr}`)

    return this.client
  }

  async writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    fromDate: Date | null,
    toDate: Date,
  ): Promise<WriteKpiResult> {
    this.logger.log(
      `Writing KPI to contract ${kpiContractId} for project ${projectId}: ` +
        `value=${kpiValue}, range=[${fromDate?.toISOString() || "null"}, ${toDate.toISOString()}]`,
    )

    try {
      // Ensure client is initialized (lazy loading from DB config)
      const client = await this.ensureClient()

      // Prepare function parameters
      // Contract function signature:
      // addKpiData(uint256 fromDate, uint256 toDate, uint256 kpiValue)
      const functionParams = new ContractFunctionParameters()
        .addUint256(fromDate ? Math.floor(fromDate.getTime() / 1000) : 0) // 0 for first execution
        .addUint256(Math.floor(toDate.getTime() / 1000)) // Unix timestamp
        .addUint256(Math.floor(kpiValue * 1000000)) // Convert to fixed point if needed

      // Execute contract function
      const transaction = new ContractExecuteTransaction()
        .setContractId(kpiContractId)
        .setGas(500000) // Adjust gas as needed
        .setFunction("addKpiData", functionParams)

      const txResponse = await transaction.execute(client)
      const receipt = await txResponse.getReceipt(client)

      if (receipt.status.toString() !== "SUCCESS") {
        throw new Error(`Transaction failed with status: ${String(receipt.status)}`)
      }

      const transactionHash = txResponse.transactionId.toString()

      this.logger.log(`Successfully wrote KPI to contract. TX: ${transactionHash}`)

      return {
        transactionHash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Failed to write KPI to contract: ${error instanceof Error ? error.message : "Unknown error"}`)
      throw error
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.close()
    }
  }
}
