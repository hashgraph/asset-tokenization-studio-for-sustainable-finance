import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import EventListenerPort from "@port/adapter/blockchain/EventListenerPort";
import EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort";
import BlockchainEventListenerAdapter from "@port/adapter/blockchain/BlockchainEventListenerAdapter";
import BlockchainEventFetcherAdapter from "@port/adapter/blockchain/BlockchainEventFetcherAdapter";
import BlockchainEventListenerAppService from "@app/BlockchainEventListenerAppService";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  providers: [
    BlockchainEventListenerAdapter,
    {
      provide: "EventListenerPort",
      useExisting: BlockchainEventListenerAdapter,
    },
    BlockchainEventFetcherAdapter,
    {
      provide: "EventFetcherPort",
      useExisting: BlockchainEventFetcherAdapter,
    },
    BlockchainEventListenerAppService,
  ],
  exports: ["EventListenerPort"]
})
export class BlockchainEventListenerModule {}
