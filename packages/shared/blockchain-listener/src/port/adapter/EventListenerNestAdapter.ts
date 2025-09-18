import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core";
import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService";

@Singleton()
export default class BlockchainEventListenerNestAdapter
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly listenerAppService: BlockchainEventListenerAppService
  ) {}

  async onModuleInit() {
    await this.listenerAppService.start();
  }

  async onModuleDestroy() {
    await this.listenerAppService.stop();
  }
}