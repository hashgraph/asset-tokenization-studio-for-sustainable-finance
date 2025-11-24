// SPDX-License-Identifier: Apache-2.0
import { Get, Patch, Body, Inject } from "@nestjs/common"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import type { IndexerConfigRepository } from "@domain/indexer/repositories/IndexerConfigRepository"
import { UpdateIndexerConfigRequest } from "./updateindexerconfig/model/UpdateIndexerConfigRequest"
import { IndexerConfigResponse } from "./updateindexerconfig/model/IndexerConfigResponse"

@RestController("indexer/config")
export class IndexerConfigHttpAdapter {
  constructor(
    @Inject("IndexerConfigRepository")
    private readonly configRepository: IndexerConfigRepository,
  ) {}

  @Get()
  async getConfig(): Promise<IndexerConfigResponse> {
    const config = await this.configRepository.getOrCreateDefault()
    return IndexerConfigResponse.fromDomain(config)
  }

  @Patch()
  async updateConfig(@Body() request: UpdateIndexerConfigRequest): Promise<IndexerConfigResponse> {
    const config = await this.configRepository.getOrCreateDefault()

    config.update(request.endpoint, request.apiKey)

    const savedConfig = await this.configRepository.save(config)
    return IndexerConfigResponse.fromDomain(savedConfig)
  }
}
