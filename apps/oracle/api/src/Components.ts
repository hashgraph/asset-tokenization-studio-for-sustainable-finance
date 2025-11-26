// SPDX-License-Identifier: Apache-2.0

/**
 * Components registry for dependency injection
 */

import { APP_FILTER } from "@nestjs/core"

// Shared Core Providers
import { COMMON_FUNCTIONALITY_PROVIDERS, COMMON_FUNCTIONALITY_ENTITIES, RestExceptionFilter } from "@hashgraph/green-bonds-shared-core"

// HTTP Adapters
import { HealthHttpAdapter } from "@port/health/HealthHttpAdapter"
import { CreateOracleRegistryHttpAdapter } from "@port/oracle/usecase/createoracleregistry/CreateOracleRegistryHttpAdapter"
import { GetOracleRegistryHttpAdapter } from "@port/oracle/usecase/getoracleregistry/GetOracleRegistryHttpAdapter"
import { ListOracleRegistriesHttpAdapter } from "@port/oracle/usecase/listoracleregistries/ListOracleRegistriesHttpAdapter"
import { UpdateOracleRegistryHttpAdapter } from "@port/oracle/usecase/updateoracleregistry/UpdateOracleRegistryHttpAdapter"
import { AddProjectHttpAdapter } from "@port/oracle/usecase/addproject/AddProjectHttpAdapter"
import { RemoveProjectHttpAdapter } from "@port/oracle/usecase/removeproject/RemoveProjectHttpAdapter"
import { UpdateProjectTopicHttpAdapter } from "@port/oracle/usecase/updateprojecttopic/UpdateProjectTopicHttpAdapter"
import { UpdateFrequencyHttpAdapter } from "@port/oracle/usecase/updatefrequency/UpdateFrequencyHttpAdapter"
import { DeleteOracleRegistryHttpAdapter } from "@port/oracle/usecase/deleteoracleregistry/DeleteOracleRegistryHttpAdapter"
import { GetExecutionHistoryHttpAdapter } from "@port/oracle/usecase/getexecutionhistory/GetExecutionHistoryHttpAdapter"

// Application Layer - Command Handlers
import { CreateOracleRegistryCommandHandler } from "@app/oracle/createoracleregistry/command/CreateOracleRegistryCommandHandler"
import { UpdateOracleRegistryCommandHandler } from "@app/oracle/updateoracleregistry/command/UpdateOracleRegistryCommandHandler"
import { AddProjectCommandHandler } from "@app/oracle/addproject/command/AddProjectCommandHandler"
import { RemoveProjectCommandHandler } from "@app/oracle/removeproject/command/RemoveProjectCommandHandler"
import { UpdateProjectTopicCommandHandler } from "@app/oracle/updateprojecttopic/command/UpdateProjectTopicCommandHandler"
import { DeleteOracleRegistryCommandHandler } from "@app/oracle/deleteoracleregistry/command/DeleteOracleRegistryCommandHandler"

// Application Layer - Query Handlers
import { GetOracleRegistryQueryHandler } from "@app/oracle/getoracleregistry/query/GetOracleRegistryQueryHandler"
import { ListOracleRegistriesQueryHandler } from "@app/oracle/listoracleregistries/query/ListOracleRegistriesQueryHandler"
import { GetExecutionHistoryQueryHandler } from "@app/oracle/getexecutionhistory/query/GetExecutionHistoryQueryHandler"

// Domain Layer - Services
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService"
import { AutoRetryService } from "@domain/scheduler/services/AutoRetryService"

// Port Adapters - Repositories
import { OracleRegistryTypeOrmRepository } from "@port/oracle/persistence/repositories/OracleRegistryTypeOrmRepository"
import { ScheduledTaskTypeOrmRepository } from "@port/oracle/persistence/repositories/ScheduledTaskTypeOrmRepository"

// Port Adapters - External Clients
import { IndexerApiClient } from "@port/indexer/IndexerApiClient"
import { DynamicBlockchainAdapter } from "@port/blockchain/DynamicBlockchainAdapter"

// Port Adapters - Blockchain Config
import { BlockchainConfigHttpAdapter } from "@port/blockchain/usecase/BlockchainConfigHttpAdapter"
import { BlockchainConfigTypeOrmRepository } from "@port/blockchain/persistence/repositories/BlockchainConfigTypeOrmRepository"

// Port Adapters - Scheduler
import { SchedulerService } from "@port/scheduler/SchedulerService"
import { SchedulerConfigHttpAdapter } from "@port/scheduler/usecase/SchedulerConfigHttpAdapter"
import { SchedulerConfigTypeOrmRepository } from "@port/scheduler/persistence/repositories/SchedulerConfigTypeOrmRepository"

// Port Adapters - Indexer Config
import { IndexerConfigHttpAdapter } from "@port/indexer/usecase/IndexerConfigHttpAdapter"
import { IndexerConfigTypeOrmRepository } from "@port/indexer/persistence/repositories/IndexerConfigTypeOrmRepository"

// Persistence Models
import { OracleRegistryPersistence } from "@port/oracle/persistence/model/OracleRegistryPersistence"
import { ScheduledTaskResultPersistence } from "@port/oracle/persistence/model/ScheduledTaskResultPersistence"
import { SchedulerConfigPersistence } from "@port/scheduler/persistence/model/SchedulerConfigPersistence"
import { IndexerConfigPersistence } from "@port/indexer/persistence/model/IndexerConfigPersistence"
import { BlockchainConfigPersistence } from "@port/blockchain/persistence/model/BlockchainConfigPersistence"

export const ENTITIES = [
  ...COMMON_FUNCTIONALITY_ENTITIES,
  OracleRegistryPersistence,
  ScheduledTaskResultPersistence,
  SchedulerConfigPersistence,
  IndexerConfigPersistence,
  BlockchainConfigPersistence,
]

export const CONTROLLERS: any[] = [
  // Health HTTP Adapter
  HealthHttpAdapter,

  // Oracle Registry HTTP Adapters
  CreateOracleRegistryHttpAdapter,
  GetOracleRegistryHttpAdapter,
  ListOracleRegistriesHttpAdapter,
  UpdateOracleRegistryHttpAdapter,
  AddProjectHttpAdapter,
  RemoveProjectHttpAdapter,
  UpdateProjectTopicHttpAdapter,
  UpdateFrequencyHttpAdapter,
  DeleteOracleRegistryHttpAdapter,

  // Execution History HTTP Adapters
  GetExecutionHistoryHttpAdapter,

  // Scheduler Config HTTP Adapter
  SchedulerConfigHttpAdapter,

  // Indexer Config HTTP Adapter
  IndexerConfigHttpAdapter,

  // Blockchain Config HTTP Adapter
  BlockchainConfigHttpAdapter,
]

// CQRS Command Handlers
export const COMMAND_HANDLERS = [
  CreateOracleRegistryCommandHandler,
  UpdateOracleRegistryCommandHandler,
  AddProjectCommandHandler,
  RemoveProjectCommandHandler,
  UpdateProjectTopicCommandHandler,
  DeleteOracleRegistryCommandHandler,
]

// CQRS Query Handlers
export const QUERY_HANDLERS = [
  GetOracleRegistryQueryHandler,
  ListOracleRegistriesQueryHandler,
  GetExecutionHistoryQueryHandler,
]

export const PROVIDERS: any[] = [
  // Global Exception Filter
  {
    provide: APP_FILTER,
    useClass: RestExceptionFilter,
  },

  // CQRS Handlers
  ...COMMAND_HANDLERS,
  ...QUERY_HANDLERS,

  // Domain Services
  OracleExecutionService,
  AutoRetryService,

  // Repositories
  {
    provide: "OracleRegistryRepository",
    useClass: OracleRegistryTypeOrmRepository,
  },
  {
    provide: "ScheduledTaskResultRepository",
    useClass: ScheduledTaskTypeOrmRepository,
  },

  // External Clients
  {
    provide: "IndexerPort",
    useClass: IndexerApiClient,
  },
  {
    provide: "BlockchainPort",
    useClass: DynamicBlockchainAdapter,
  },

  // Scheduler
  SchedulerService,
  {
    provide: "SchedulerConfigRepository",
    useClass: SchedulerConfigTypeOrmRepository,
  },

  // Indexer Config
  {
    provide: "IndexerConfigRepository",
    useClass: IndexerConfigTypeOrmRepository,
  },

  // Blockchain Config
  {
    provide: "BlockchainConfigRepository",
    useClass: BlockchainConfigTypeOrmRepository,
  },

  // Transaction Builder (stub - oracle doesn't build transactions)
  {
    provide: "TransactionBuilderPort",
    useValue: null,
  },

  // Shared Core Providers (CommandBus, QueryBus, EventBus, etc.)
  ...COMMON_FUNCTIONALITY_PROVIDERS,
]
