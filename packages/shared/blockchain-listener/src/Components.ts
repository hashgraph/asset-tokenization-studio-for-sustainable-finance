// SPDX-License-Identifier: Apache-2.0

import { Provider } from "@nestjs/common"
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService"
import { ProcessEventDomainService } from "@domain/eventstore/service/ProcessEventDomainService"
import { ProcessEventCommandHandler } from "@app/eventstore/processevent/command/ProcessEventCommandHandler"
import EventListenerAdapter from "@port/listener/usecase/listenevents/EventListenerAdapter"
import DecodeEventAdapter from "@port/blockchain/usecase/decodeevent/DecodeEventAdapter"
import MirrorNodeQueryAdapter from "@port/blockchain/usecase/querymirrornode/MirrorNodeQueryAdapter"
import EventFetcherAdapter from "@port/blockchain/usecase/fetchevents/EventFetcherAdapter"
import { EventStoreTypeOrmRepository } from "@port/persistence/eventstore/repositories/EventStoreTypeOrmRepository"
import BlockchainEventListenerNestAdapter from "@port/usecase/managenestlifecycle/NestLifeCycleAdapter"

const REPOSITORIES: Provider[] = [
  {
    provide: "EventStoreRepository",
    useClass: EventStoreTypeOrmRepository,
  },
]

export const PROVIDERS = [
  ...REPOSITORIES,
  BlockchainEventListenerNestAdapter,
  BlockchainEventListenerAppService,
  ProcessEventDomainService,
  ProcessEventCommandHandler,
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
]
