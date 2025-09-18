import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Singleton, Logger } from "@hashgraph/green-bonds-shared-core";
import EventListenerAdapter from "@port/adapter/listener/EventListenerAdapter";

@Singleton()
export default class BlockchainEventListenerAppService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BlockchainEventListenerAppService.name);

  constructor(
    private readonly eventListener: EventListenerAdapter
  ) {}

  async onModuleInit() {
    this.logger.log("Starting blockchain event listener...");
    this.eventListener.subscribe(
      (event) => {
        this.logger.log(`Event received: ${JSON.stringify(event)}`);
        // domain logic
      },
    );
  }

  async onModuleDestroy() {
    this.logger.log("Stopping blockchain event listener...");
    this.eventListener.unsubscribe?.();
  }
}