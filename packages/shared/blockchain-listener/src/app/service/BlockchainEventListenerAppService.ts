import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import type EventListenerPort from "@port/adapter/blockchain/EventListenerPort";

@Injectable()
export default class BlockchainEventListenerAppService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BlockchainEventListenerAppService.name);

  constructor(
    @Inject("EventListenerPort")
    private readonly eventListener: EventListenerPort
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