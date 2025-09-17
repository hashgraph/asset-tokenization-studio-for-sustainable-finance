import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import EventListenerPort from "@port/adapter/listener/EventListenerPort";
import EventFetcherPort from "@port/adapter/blockchain/EventFetcherPort";
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
    EventListenerAdapter,
    {
      provide: "EventListenerPort",
      useExisting: EventListenerAdapter,
    },
    EventFetcherAdapter,
    {
      provide: "EventFetcherPort",
      useExisting: EventFetcherAdapter,
    },
    BlockchainEventListenerAppService,
  ],
  exports: ["EventListenerPort"]
})
export class BlockchainEventListenerModule {}
