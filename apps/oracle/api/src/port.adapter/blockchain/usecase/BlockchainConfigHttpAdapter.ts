// SPDX-License-Identifier: Apache-2.0
import { Get, Patch, Body, Inject } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import type { BlockchainConfigRepository } from "@domain/blockchain/repositories/BlockchainConfigRepository"
import { UpdateBlockchainConfigRequest } from "./updateblockchainconfig/model/UpdateBlockchainConfigRequest"
import { BlockchainConfigResponse } from "./updateblockchainconfig/model/BlockchainConfigResponse"

@RestController("blockchain/config")
export class BlockchainConfigHttpAdapter {
  constructor(
    @Inject("BlockchainConfigRepository")
    private readonly configRepository: BlockchainConfigRepository,
  ) {}

  @Get()
  async getConfig(): Promise<BlockchainConfigResponse> {
    const config = await this.configRepository.getOrCreateDefault()
    return BlockchainConfigResponse.fromDomain(config)
  }

  @Patch()
  async updateConfig(@Body() request: UpdateBlockchainConfigRequest): Promise<BlockchainConfigResponse> {
    const config = await this.configRepository.getOrCreateDefault()

    config.update(request.network, request.rpcEndpoint, request.useJsonRpc)

    const savedConfig = await this.configRepository.save(config)
    return BlockchainConfigResponse.fromDomain(savedConfig)
  }
}
