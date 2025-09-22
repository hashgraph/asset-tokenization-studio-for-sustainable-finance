// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PROVIDERS } from "./Components"
import { ConfigurationModule } from "@hashgraph/green-bonds-shared-core"
import EventListenerAdapter from "./port.adapter/listener/usecase/listenevents/EventListenerAdapter"
import DecodeEventAdapter from "./port.adapter/blockchain/usecase/decodeevent/DecodeEventAdapter"
import EventFetcherAdapter from "./port.adapter/blockchain/usecase/fetchevents/EventFetcherAdapter"
import MirrorNodeQueryAdapter from "./port.adapter/blockchain/usecase/querymirrornode/MirrorNodeQueryAdapter"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    ...PROVIDERS,
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
    }
  ],
  exports: PROVIDERS,
})
export class BlockchainEventListenerModule {}
