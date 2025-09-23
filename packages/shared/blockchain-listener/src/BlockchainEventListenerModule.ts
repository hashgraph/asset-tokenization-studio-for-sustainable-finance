// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { ConfigurationModule } from "@hashgraph/green-bonds-shared-core"
import EventListenerAdapter from "./port.adapter/listener/usecase/listenevents/EventListenerAdapter"
import DecodeEventAdapter from "./port.adapter/blockchain/usecase/decodeevent/DecodeEventAdapter"
import EventFetcherAdapter from "./port.adapter/blockchain/usecase/fetchevents/EventFetcherAdapter"
import MirrorNodeQueryAdapter from "./port.adapter/blockchain/usecase/querymirrornode/MirrorNodeQueryAdapter"
import EventListenerNestAdapter from "./port.adapter/usecase/managenestlifecycle/NestLifeCycleAdapter"
import BlockchainEventListenerAppService from "./app/service/BlockchainEventListenerAppService"

@Module({
  imports: [ConfigurationModule.forRoot()],
  providers: [
    EventListenerAdapter,
    EventListenerNestAdapter,
    EventFetcherAdapter,
    DecodeEventAdapter,
    MirrorNodeQueryAdapter,
    BlockchainEventListenerAppService,
    {
      provide: "EventListener",
      useClass: EventListenerAdapter,
    },
    {
      provide: "DecodeEvent",
      useClass: DecodeEventAdapter,
    },
    {
      provide: "MirrorNode",
      useClass: MirrorNodeQueryAdapter,
    },
    {
      provide: "EventFetcher",
      useClass: EventFetcherAdapter,
    },
  ],
  exports: [
    EventListenerAdapter,
    EventListenerNestAdapter,
    EventFetcherAdapter,
    DecodeEventAdapter,
    MirrorNodeQueryAdapter,
    BlockchainEventListenerAppService,
  ],
})
export class BlockchainEventListenerModule {}
