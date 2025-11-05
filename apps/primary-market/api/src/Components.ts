// SPDX-License-Identifier: Apache-2.0

import { AppService } from "./AppService"
import { AppController } from "./AppController"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { Provider } from "@nestjs/common"
import { CreateOfferingTransactionHttpAdapter } from "@port/transaction/usecase/createoffering/CreateOfferingTransactionHttpAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter"
import { SubmitSubscriptionTransactionHttpAdapter } from "@port/transaction/usecase/submitsubscription/SubmitSubscriptionTransactionHttpAdapter"
import { CreateOfferingTransactionAppService } from "@app/transaction/createoffering/service/CreateOfferingTransactionAppService"
import { GrantRoleTransactionAppService } from "@app/transaction/grantrole/service/GrantRoleTransactionAppService"
import { SubmitSubscriptionTransactionAppService } from "@app/transaction/submitsubscription/service/SubmitSubscriptionTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { PrimaryMarketTypeORMRepository } from "@port/persistence/primarymarket/repositories/PrimaryMarketTypeORMRepository"
import { OfferingTypeORMRepository } from "@port/persistence/offering/repositories/OfferingTypeORMRepository"
import { RoleTypeORMRepository } from "@port/persistence/role/repositories/RoleTypeORMRepository"
import { UserTypeORMRepository } from "@port/persistence/user/repositories/UserTypeORMRepository"
import { UserMarketRoleTypeORMRepository } from "@port/persistence/usermarketrole/repositories/UserMarketRoleTypeORMRepository"
import { InvestorTypeORMRepository } from "@port/persistence/investor/repositories/InvestorTypeORMRepository"
import { SubscriptionTypeORMRepository } from "@port/persistence/subscription/repositories/SubscriptionTypeORMRepository"
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { CancelOfferingDomainService } from "@domain/offering/services/CancelOfferingDomainService"
import { ExecuteOfferingDomainService } from "@domain/offering/services/ExecuteOfferingDomainService"
import { SubmitSubscriptionDomainService } from "@domain/subscription/services/SubmitSubscriptionDomainService"
import { CancelSubscriptionDomainService } from "@domain/subscription/services/CancelSubscriptionDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import { CheckSubscriptionExistsDomainService } from "@domain/subscription/services/CheckSubscriptionExistsDomainService"
import { UpdateSubscriptionsStatusDomainService } from "@domain/subscription/services/UpdateSubscriptionsStatusDomainService"
import { GrantUserMarketRoleDomainService } from "@domain/usermarketrole/services/GrantUserMarketRoleDomainService"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CreateOfferingNestJSEventAdapter } from "@port/offering/usecase/createoffering/CreateOfferingNestJSEventAdapter"
import { GrantRoleNestJSEventAdapter } from "@port/role/usecase/grantrole/GrantRoleNestJSEventAdapter"
import { SubmitSubscriptionNestJSEventAdapter } from "@port/subscription/usecase/submitsubscription/SubmitSubscriptionNestJSEventAdapter"
import { CancelSubscriptionNestJSEventAdapter } from "@port/subscription/usecase/cancelsubscription/CancelSubscriptionNestJSEventAdapter"
import { CreateOfferingCommandHandler } from "@app/offering/createoffering/command/CreateOfferingCommandHandler"
import { CancelOfferingCommandHandler } from "@app/offering/canceloffering/command/CancelOfferingCommandHandler"
import { ExecuteOfferingCommandHandler } from "@app/offering/executeoffering/command/ExecuteOfferingCommandHandler"
import { GrantRoleCommandHandler } from "@app/role/grantrole/command/GrantRoleCommandHandler"
import { SubmitSubscriptionCommandHandler } from "@app/subscription/submitsubscription/command/SubmitSubscriptionCommandHandler"
import { CancelSubscriptionCommandHandler } from "@app/subscription/cancelsubscription/command/CancelSubscriptionCommandHandler"
import { GetSubscriptionQueryHandler } from "@app/subscription/getsubscription/query/GetSubscriptionQueryHandler"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"
import { InvestorPersistence } from "@port/persistence/investor/model/InvestorPersistence"
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"
import { DatabaseSeederService } from "@config/DatabaseSeederService"
import { CancelOfferingTransactionAppService } from "@app/transaction/canceloffering/service/CancelOfferingTransactionAppService"
import { ExecuteOfferingTransactionAppService } from "@app/transaction/executeoffering/service/ExecuteOfferingTransactionAppService"
import { CancelOfferingTransactionHttpAdapter } from "@port/transaction/usecase/cancelOffering/CancelOfferingTransactionHttpAdapter"
import { ExecuteOfferingTransactionHttpAdapter } from "@port/transaction/usecase/executeOffering/ExecuteOfferingTransactionHttpAdapter"
import { ExecuteOfferingNestJSEventAdapter } from "@port/offering/usecase/executeoffering/ExecuteOfferingNestJSEventAdapter"
import { CancelOfferingNestJSEventAdapter } from "@port/offering/usecase/canceloffering/CancelOfferingNestJSEventAdapter"
import { CancelSubscriptionTransactionAppService } from "@app/transaction/cancelsubscription/service/CancelSubscriptionTransactionAppService"
import { CancelSubscriptionTransactionHttpAdapter } from "@port/transaction/usecase/cancelsubscription/CancelSubscriptionTransactionHttpAdapter"
import { GetSubscriptionHttpAdapter } from "@port/subscription/usecase/getsubscription/GetSubscriptionHttpAdapter"

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
  {
    provide: "InvestorRepository",
    useClass: InvestorTypeORMRepository,
  },
  {
    provide: "SubscriptionRepository",
    useClass: SubscriptionTypeORMRepository,
  },
]

export const CONTROLLERS = [
  AppController,
  CreateOfferingTransactionHttpAdapter,
  GrantRoleTransactionHttpAdapter,
  SubmitSubscriptionTransactionHttpAdapter,
  CancelSubscriptionTransactionHttpAdapter,
  CancelOfferingTransactionHttpAdapter,
  ExecuteOfferingTransactionHttpAdapter,
  GetSubscriptionHttpAdapter,
]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
  DatabaseSeederService,
  CreateOfferingTransactionAppService,
  GrantRoleTransactionAppService,
  SubmitSubscriptionTransactionAppService,
  CancelSubscriptionTransactionAppService,
  CreateOfferingDomainService,
  CancelOfferingDomainService,
  ExecuteOfferingDomainService,
  SubmitSubscriptionDomainService,
  CancelSubscriptionDomainService,
  CheckOfferingExistsDomainService,
  CheckSubscriptionExistsDomainService,
  UpdateSubscriptionsStatusDomainService,
  GrantUserMarketRoleDomainService,
  CheckPrimaryMarketExistsDomainService,
  CreateOfferingNestJSEventAdapter,
  GrantRoleNestJSEventAdapter,
  SubmitSubscriptionNestJSEventAdapter,
  CancelSubscriptionNestJSEventAdapter,
  CreateOfferingCommandHandler,
  CancelOfferingCommandHandler,
  ExecuteOfferingCommandHandler,
  GrantRoleCommandHandler,
  SubmitSubscriptionCommandHandler,
  CancelSubscriptionCommandHandler,
  GetSubscriptionQueryHandler,
  CancelOfferingTransactionAppService,
  ExecuteOfferingTransactionAppService,
  ExecuteOfferingNestJSEventAdapter,
  CancelOfferingNestJSEventAdapter,
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
  InvestorPersistence,
  SubscriptionPersistence,
]
