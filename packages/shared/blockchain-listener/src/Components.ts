// SPDX-License-Identifier: Apache-2.0

import { Provider } from "@nestjs/common"
import { ProcessEventDomainService } from "@domain/eventstore/services/ProcessEventDomainService"
import { ProcessEventCommandHandler } from "@app/eventstore/processevent/command/ProcessEventCommandHandler"
import SetSyncStateCommandHandler from "@app/syncstate/setsyncstate/command/SetSyncStateCommandHandler"
import { EventStoreTypeOrmRepository } from "@port/persistence/eventstore/repositories/EventStoreTypeOrmRepository"
import SyncStateTypeOrmRepository from "@port/persistence/syncstate/repositories/SyncStateTypeOrmRepository"
import { EventFilterTypeOrmRepository } from "@port/persistence/eventfilter/repositories/EventFilterTypeOrmRepository"
import { AddEventFiltersCommandHandler } from "@app/eventfilter/addeventfilters/command/AddEventFiltersCommandHandler"
import { AddEventFiltersDomainService } from "@domain/eventfilter/services/AddEventFiltersDomainService"
import { ProcessBlocksAppService } from "@app/block/processblock/service/ProcessBlocksAppService"
import { EventListenerNestJSOnApplicationBootstrap } from "@port/listener/EventListenerNestJSOnApplicationBootstrap"
import { NestJSConfigService } from "@port/config/NestJSConfigService"
import { HederaMirrorNodeAdapter } from "@port/blockchain/HederaMirrorNodeAdapter"
import { GetBlockToProcessQueryHandler } from "@app/block/getblocktoprocess/query/GetBlockToProcessQueryHandler"
import { GetEventFiltersQueryHandler } from "@app/eventfilter/geteventfilters/query/GetEventFiltersQueryHandler"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"
import { EventFilterPersistence } from "@port/persistence/eventfilter/model/EventFilterPersistence"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { CreateSchema1759133092414 } from "./migrations/1759133092414-CreateSchema"
import { BlockchainEventsRabbitPublisher } from "@port/eventpublisher/BlockchainEventsRabbitPublisher"

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

export const EVENT_LISTENER_PROVIDERS = [
  ...REPOSITORIES,
  ProcessEventDomainService,
  ProcessEventCommandHandler,
  AddEventFiltersCommandHandler,
  AddEventFiltersDomainService,
  SetSyncStateCommandHandler,
  GetBlockToProcessQueryHandler,
  GetEventFiltersQueryHandler,
  ProcessBlocksAppService,
  EventListenerNestJSOnApplicationBootstrap,
  BlockchainEventsRabbitPublisher,
  {
    provide: "ConfigService",
    useClass: NestJSConfigService,
  },
  {
    provide: "HederaPort",
    useClass: HederaMirrorNodeAdapter,
  },
]

export const EVENT_LISTENER_ENTITIES: EntityClassOrSchema[] = [
  EventStorePersistence,
  EventFilterPersistence,
  SyncStatePersistence,
]

export const EVENT_LISTENER_MIGRATIONS = [CreateSchema1759133092414]
