// SPDX-License-Identifier: Apache-2.0

import { Provider } from "@nestjs/common"
import BlockchainEventListenerAppService from "@app/service/BlockchainEventListenerAppService"
import { ProcessEventDomainService } from "@domain/eventstore/services/ProcessEventDomainService"
import { ProcessEventCommandHandler } from "@app/eventstore/processevent/command/ProcessEventCommandHandler"
import SetSyncStateCommandHandler from "@app/syncstate/setsyncstate/command/SetSyncStateCommandHandler"
import GetSyncStateQueryHandler from "@app/syncstate/getsyncstate/query/GetSyncStateQueryHandler"
import EventListenerAdapter from "@port/listener/usecase/listenevents/EventListenerAdapter"
import DecodeEventAdapter from "@port/blockchain/usecase/decodeevent/DecodeEventAdapter"
import MirrorNodeQueryAdapter from "@port/blockchain/usecase/querymirrornode/MirrorNodeQueryAdapter"
import EventFetcherAdapter from "@port/blockchain/usecase/fetchevents/EventFetcherAdapter"
import { EventStoreTypeOrmRepository } from "@port/persistence/eventstore/repositories/EventStoreTypeOrmRepository"
import SyncStateTypeOrmRepository from "@port/persistence/syncstate/repositories/SyncStateTypeOrmRepository"
import BlockchainEventListenerNestAdapter from "@port/usecase/managenestlifecycle/NestLifeCycleAdapter"
import { EventFilterTypeOrmRepository } from "@port/persistence/eventfilter/repositories/EventFilterTypeOrmRepository"
import { AddEventFiltersCommandHandler } from "@app/eventfilter/addeventfilters/command/AddEventFiltersCommandHandler"
import { AddEventFiltersDomainService } from "@domain/eventfilter/services/AddEventFiltersDomainService"

const REPOSITORIES: Provider[] = [
  {
    provide: "EventStoreRepository",
    useClass: EventStoreTypeOrmRepository,
  },
  {
    provide: "EventFilterRepository",
    useClass: EventFilterTypeOrmRepository,
  },
  {
    provide: "SyncStateRepository",
    useClass: SyncStateTypeOrmRepository,
  },
]

export const PROVIDERS = [
  ...REPOSITORIES,
  BlockchainEventListenerNestAdapter,
  BlockchainEventListenerAppService,
  ProcessEventDomainService,
  ProcessEventCommandHandler,
  AddEventFiltersCommandHandler,
  AddEventFiltersDomainService,
  SetSyncStateCommandHandler,
  GetSyncStateQueryHandler,
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
