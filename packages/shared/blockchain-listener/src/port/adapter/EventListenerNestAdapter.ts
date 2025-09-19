// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core"
import { OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService"

@Singleton()
export default class BlockchainEventListenerNestAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainEventListenerNestAdapter.name)

  constructor(private readonly listenerAppService: BlockchainEventListenerAppService) {}

  async onModuleInit() {
    this.logger.debug("Initializing module...")
    await this.listenerAppService.start()
  }

  async onModuleDestroy() {
    this.logger.debug("Destroying module...")
    await this.listenerAppService.stop()
  }
}
