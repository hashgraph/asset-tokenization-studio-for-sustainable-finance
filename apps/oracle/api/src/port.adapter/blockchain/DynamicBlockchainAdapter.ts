// SPDX-License-Identifier: Apache-2.0
import { Inject, Injectable, Logger } from "@nestjs/common"
import { BlockchainPort, WriteKpiResult } from "@domain/oracle/ports/BlockchainPort"
import type { BlockchainConfigRepository } from "@domain/blockchain/repositories/BlockchainConfigRepository"
import { HederaSDKAdapter } from "./HederaSDKAdapter"
import { HederaJsonRpcAdapter } from "./HederaJsonRpcAdapter"

/**
 * DynamicBlockchainAdapter
 * Delegates to HederaSDKAdapter or HederaJsonRpcAdapter based on DB config
 */
@Injectable()
export class DynamicBlockchainAdapter implements BlockchainPort {
  private readonly logger = new Logger(DynamicBlockchainAdapter.name)
  private sdkAdapter: HederaSDKAdapter | null = null
  private jsonRpcAdapter: HederaJsonRpcAdapter | null = null

  constructor(
    @Inject("BlockchainConfigRepository")
    private readonly configRepository: BlockchainConfigRepository,
  ) {}

  async writeKpiToContract(
    kpiContractId: string,
    projectId: string,
    kpiValue: number,
    toDate: Date,
  ): Promise<WriteKpiResult> {
    const config = await this.configRepository.getOrCreateDefault()

    if (config.useJsonRpc) {
      this.logger.debug("Using JSON-RPC adapter")
      return this.getJsonRpcAdapter().writeKpiToContract(kpiContractId, projectId, kpiValue, toDate)
    } else {
      this.logger.debug("Using Hedera SDK adapter")
      return this.getSdkAdapter().writeKpiToContract(kpiContractId, projectId, kpiValue, toDate)
    }
  }

  private getSdkAdapter(): HederaSDKAdapter {
    if (!this.sdkAdapter) {
      this.sdkAdapter = new HederaSDKAdapter(this.configRepository)
    }
    return this.sdkAdapter
  }

  private getJsonRpcAdapter(): HederaJsonRpcAdapter {
    if (!this.jsonRpcAdapter) {
      this.jsonRpcAdapter = new HederaJsonRpcAdapter(this.configRepository)
    }
    return this.jsonRpcAdapter
  }

  onModuleDestroy() {
    if (this.sdkAdapter && typeof this.sdkAdapter.onModuleDestroy === "function") {
      this.sdkAdapter.onModuleDestroy()
    }
  }
}
