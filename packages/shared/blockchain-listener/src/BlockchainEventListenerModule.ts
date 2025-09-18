import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import EventListenerAdapter from "@port/adapter/listener/EventListenerAdapter";
import EventFetcherAdapter from "@port/adapter/blockchain/EventFetcherAdapter";
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  providers: [
    EventFetcherAdapter,
    EventListenerAdapter,
    BlockchainEventListenerAppService,
  ],
  exports: [EventFetcherAdapter, EventListenerAdapter]
})
export class BlockchainEventListenerModule {}
