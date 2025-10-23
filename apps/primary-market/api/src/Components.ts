// SPDX-License-Identifier: Apache-2.0

import { AppService } from "./AppService"
import { AppController } from "./AppController"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { Provider } from "@nestjs/common"
import { CreateOfferingTransactionHttpAdapter } from "@port/transaction/usecase/createoffering/CreateOfferingTransactionHttpAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter"
import { CreateOfferingTransactionAppService } from "@app/transaction/createoffering/service/CreateOfferingTransactionAppService"
import { GrantRoleTransactionAppService } from "@app/transaction/grantrole/service/GrantRoleTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { PrimaryMarketTypeORMRepository } from "@port/persistence/primarymarket/repositories/PrimaryMarketTypeORMRepository"
import { OfferingTypeORMRepository } from "@port/persistence/offering/repositories/OfferingTypeORMRepository"
import { RoleTypeORMRepository } from "@port/persistence/role/repositories/RoleTypeORMRepository"
import { UserTypeORMRepository } from "@port/persistence/user/repositories/UserTypeORMRepository"
import { UserMarketRoleTypeORMRepository } from "@port/persistence/usermarketrole/repositories/UserMarketRoleTypeORMRepository"
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { GrantUserMarketRoleDomainService } from "@domain/usermarketrole/services/GrantUserMarketRoleDomainService"
import { CheckPrimaryMarketActiveDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketActiveDomainService"
import { CreateOfferingNestJSEventAdapter } from "@port/offering/usecase/createoffering/CreateOfferingNestJSEventAdapter"
import { GrantRoleNestJSEventAdapter } from "@port/role/usecase/grantrole/GrantRoleNestJSEventAdapter"
import { CreateOfferingCommandHandler } from "@app/offering/createoffering/command/CreateOfferingCommandHandler"
import { GrantRoleCommandHandler } from "@app/role/grantrole/command/GrantRoleCommandHandler"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { DatabaseSeederService } from "@config/DatabaseSeederService"

const REPOSITORIES: Provider[] = [
  {
    provide: "PrimaryMarketRepository",
    useClass: PrimaryMarketTypeORMRepository,
  },
  {
    provide: "OfferingRepository",
    useClass: OfferingTypeORMRepository,
  },
  {
    provide: "RoleRepository",
    useClass: RoleTypeORMRepository,
  },
  {
    provide: "UserRepository",
    useClass: UserTypeORMRepository,
  },
  {
    provide: "UserMarketRoleRepository",
    useClass: UserMarketRoleTypeORMRepository,
  },
]

export const CONTROLLERS = [AppController, CreateOfferingTransactionHttpAdapter, GrantRoleTransactionHttpAdapter]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
  DatabaseSeederService,
  CreateOfferingTransactionAppService,
  GrantRoleTransactionAppService,
  CreateOfferingDomainService,
  GrantUserMarketRoleDomainService,
  CheckPrimaryMarketActiveDomainService,
  CreateOfferingNestJSEventAdapter,
  GrantRoleNestJSEventAdapter,
  CreateOfferingCommandHandler,
  GrantRoleCommandHandler,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  OfferingPersistence,
  PrimaryMarketPersistence,
  RolePersistence,
  UserPersistence,
  UserMarketRolePersistence,
]
