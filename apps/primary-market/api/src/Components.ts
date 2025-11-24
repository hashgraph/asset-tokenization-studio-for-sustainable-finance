// SPDX-License-Identifier: Apache-2.0

import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { Provider } from "@nestjs/common"
import { CreateOfferingTransactionHttpAdapter } from "@port/transaction/usecase/createoffering/CreateOfferingTransactionHttpAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter"
import { SubmitSubscriptionTransactionHttpAdapter } from "@port/transaction/usecase/submitsubscription/SubmitSubscriptionTransactionHttpAdapter"
import { CreateOfferingTransactionAppService } from "@app/transaction/createoffering/service/CreateOfferingTransactionAppService"
import { SubmitSubscriptionTransactionAppService } from "@app/transaction/submitsubscription/service/SubmitSubscriptionTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { PrimaryMarketTypeORMRepository } from "@port/persistence/primarymarket/repositories/PrimaryMarketTypeORMRepository"
import { OfferingTypeORMRepository } from "@port/persistence/offering/repositories/OfferingTypeORMRepository"
import { SubscriptionTypeORMRepository } from "@port/persistence/subscription/repositories/SubscriptionTypeORMRepository"
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { CancelOfferingDomainService } from "@domain/offering/services/CancelOfferingDomainService"
import { ExecuteOfferingDomainService } from "@domain/offering/services/ExecuteOfferingDomainService"
import { SubmitSubscriptionDomainService } from "@domain/subscription/services/SubmitSubscriptionDomainService"
import { CancelSubscriptionDomainService } from "@domain/subscription/services/CancelSubscriptionDomainService"
import { CheckOfferingExistsDomainService } from "@domain/offering/services/CheckOfferingExistsDomainService"
import { CheckSubscriptionExistsDomainService } from "@domain/subscription/services/CheckSubscriptionExistsDomainService"
import { UpdateSubscriptionsStatusDomainService } from "@domain/subscription/services/UpdateSubscriptionsStatusDomainService"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CreateOfferingNestJSEventAdapter } from "@port/offering/usecase/createoffering/CreateOfferingNestJSEventAdapter"
import { SubmitSubscriptionNestJSEventAdapter } from "@port/subscription/usecase/submitsubscription/SubmitSubscriptionNestJSEventAdapter"
import { CancelSubscriptionNestJSEventAdapter } from "@port/subscription/usecase/cancelsubscription/CancelSubscriptionNestJSEventAdapter"
import { CreateOfferingCommandHandler } from "@app/offering/createoffering/command/CreateOfferingCommandHandler"
import { CancelOfferingCommandHandler } from "@app/offering/canceloffering/command/CancelOfferingCommandHandler"
import { ExecuteOfferingCommandHandler } from "@app/offering/executeoffering/command/ExecuteOfferingCommandHandler"
import { SubmitSubscriptionCommandHandler } from "@app/subscription/submitsubscription/command/SubmitSubscriptionCommandHandler"
import { CancelSubscriptionCommandHandler } from "@app/subscription/cancelsubscription/command/CancelSubscriptionCommandHandler"
import { GetSubscriptionQueryHandler } from "@app/subscription/getsubscription/query/GetSubscriptionQueryHandler"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
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
import { GetPrimaryMarketHttpAdapter } from "@port/primarymarket/usecase/getprimarymarket/GetPrimaryMarketHttpAdapter"
import { GetPrimaryMarketQueryHandler } from "@app/primarymarket/getprimarymarket/query/GetPrimaryMarketQueryHandler"
import { GetPrimaryMarketsHttpAdapter } from "@port/primarymarket/usecase/getprimarymarkets/GetPrimaryMarketsHttpAdapter"
import { GetPrimaryMarketsQueryHandler } from "@app/primarymarket/getprimarymarkets/query/GetPrimaryMarketsQueryHandler"
import { GetSubscriptionsHttpAdapter } from "@port/subscription/usecase/getsubscriptions/GetSubscriptionsHttpAdapter"
import { GetSubscriptionsQueryHandler } from "@app/subscription/getsubscriptions/query/GetSubscriptionsQueryHandler"
import { GetPrimaryMarketBondsHttpAdapter } from "@port/primarymarket/usecase/getprimarymarketbonds/GetPrimaryMarketsHttpAdapter"
import { GetPrimaryMarketBondsQueryHandler } from "@app/primarymarket/getprimarymarketbonds/query/GetPrimaryMarketBondsQueryHandler"
import { GetPrimaryMarketBondOfferingsHttpAdapter } from "@port/primarymarket/usecase/getprimarymarketbondofferings/GetPrimaryMarketBondOfferingsHttpAdapter"
import { GetPrimaryMarketBondOfferingsQueryHandler } from "@app/primarymarket/getprimarymarketbondofferings/query/GetPrimaryMarketBondOfferingsQueryHandler"
import { GetSubscriptionsByInvestorHttpAdapter } from "@port/subscription/usecase/getsubscriptionsbyinvestor/GetSubscriptionsByInvestorHttpAdapter"
import { GetSubscriptionsByInvestorQueryHandler } from "@app/subscription/getsubscriptionsbyinvestor/query/GetSubscriptionsByInvestorQueryHandler"
import { GetRoleMembersHttpAdapter } from "@port/role/usecase/getrolemembers/GetRoleMembersHttpAdapter"
import { GetOfferingHttpAdapter } from "@port/offering/usecase/getoffering/GetOfferingHttpAdapter"
import { GetOfferingQueryHandler } from "@app/offering/getoffering/query/GetOfferingQueryHandler"
import { BlockchainAdapter } from "@port/blockchain/BlockchainAdapter"
import {
  TypeOrmTransactionManager,
  UserRolePersistence,
  COMMON_FUNCTIONALITY_PROVIDERS,
} from "@hashgraph/green-bonds-shared-core"
import { GrantRoleNestJSEventAdapter } from "@port/role/usecase/grantrole/GrantRoleNestJSEventAdapter"
import { RenounceRoleTransactionHttpAdapter } from "@port/transaction/usecase/renouncerole/RenounceRoleTransactionHttpAdapter"
import { RenounceRoleNestJSEventAdapter } from "@port/role/usecase/renouncerole/RenounceRoleNestJSEventAdapter"
import { ApplyRolesTransactionHttpAdapter } from "@port/transaction/usecase/applyroles/ApplyRolesTransactionHttpAdapter"
import { ApplyRolesNestJSEventAdapter } from "@port/role/usecase/applyroles/ApplyRolesNestJSEventAdapter"
import { PausePrimaryMarketTransactionHttpAdapter } from "@port/transaction/usecase/pauseprimarymarket/PausePrimaryMarketTransactionHttpAdapter"
import { UnpausePrimaryMarketTransactionHttpAdapter } from "@port/transaction/usecase/unpauseprimarymarket/UnpausePrimaryMarketTransactionHttpAdapter"
import { PausePrimaryMarketNestJSEventAdapter } from "@port/primarymarket/usecase/pauseprimarymarket/PausePrimaryMarketNestJSEventAdapter"
import { UnpausePrimaryMarketNestJSEventAdapter } from "@port/primarymarket/usecase/unpauseprimarymarket/UnpausePrimaryMarketNestJSEventAdapter"
import { PausePrimaryMarketCommandHandler } from "@app/primarymarket/pauseprimarymarket/command/PausePrimaryMarketCommandHandler"
import { UnpausePrimaryMarketCommandHandler } from "@app/primarymarket/unpauseprimarymarket/command/UnpausePrimaryMarketCommandHandler"
import { PrimaryMarketFactoryPersistence } from "@port/persistence/primarymarketfactory/model/PrimaryMarketFactoryPersistence"
import { PrimaryMarketFactoryTypeORMRepository } from "@port/persistence/primarymarketfactory/repositories/PrimaryMarketFactoryTypeORMRepository"
import { PausePrimaryMarketFactoryCommandHandler } from "@app/primarymarketfactory/pauseprimarymarketfactory/command/PausePrimaryMarketFactoryCommandHandler"
import { UnpausePrimaryMarketFactoryCommandHandler } from "@app/primarymarketfactory/unpauseprimarymarketfactory/command/UnpausePrimaryMarketFactoryCommandHandler"
import { PausePrimaryMarketFactoryTransactionHttpAdapter } from "@port/transaction/usecase/pauseprimarymarketfactorytransaction/PausePrimaryMarketFactoryTransactionHttpAdapter"
import { UnpausePrimaryMarketFactoryTransactionHttpAdapter } from "@port/transaction/usecase/unpauseprimarymarketfactorytransaction/UnpausePrimaryMarketFactoryTransactionHttpAdapter"
import { PausePrimaryMarketFactoryNestJSEventAdapter } from "@port/primarymarketfactory/usecase/pauseprimarymarketfactory/PausePrimaryMarketFactoryNestJSEventAdapter"
import { UnpausePrimaryMarketFactoryNestJSEventAdapter } from "@port/primarymarketfactory/usecase/unpauseprimarymarketfactory/UnpausePrimaryMarketFactoryNestJSEventAdapter"
import { GetPrimaryMarketFactoryRoleMembersHttpAdapter } from "@port/primarymarketfactory/usecase/getprimarymarketfactoryrolemembers/GetPrimaryMarketFactoryRoleMembersHttpAdapter"
import { GrantPrimaryMarketFactoryRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantprimarymarketfactoryrole/GrantPrimaryMarketFactoryRoleTransactionHttpAdapter"
import { RevokePrimaryMarketFactoryRoleTransactionHttpAdapter } from "@port/transaction/usecase/revokeprimarymarketfactoryrole/RevokePrimaryMarketFactoryRoleTransactionHttpAdapter"
import { GetPrimaryMarketFactoryUserRolesHttpAdapter } from "@port/primarymarketfactory/usecase/getprimarymarketfactoryuserroles/GetPrimaryMarketFactoryUserRolesHttpAdapter"

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
    provide: "SubscriptionRepository",
    useClass: SubscriptionTypeORMRepository,
  },
  {
    provide: "PrimaryMarketFactoryRepository",
    useClass: PrimaryMarketFactoryTypeORMRepository,
  },
]

export const CONTROLLERS = [
  CreateOfferingTransactionHttpAdapter,
  GrantRoleTransactionHttpAdapter,
  RenounceRoleTransactionHttpAdapter,
  ApplyRolesTransactionHttpAdapter,
  SubmitSubscriptionTransactionHttpAdapter,
  CancelSubscriptionTransactionHttpAdapter,
  CancelOfferingTransactionHttpAdapter,
  ExecuteOfferingTransactionHttpAdapter,
  PausePrimaryMarketTransactionHttpAdapter,
  UnpausePrimaryMarketTransactionHttpAdapter,
  PausePrimaryMarketFactoryTransactionHttpAdapter,
  UnpausePrimaryMarketFactoryTransactionHttpAdapter,
  GetPrimaryMarketFactoryRoleMembersHttpAdapter,
  GrantPrimaryMarketFactoryRoleTransactionHttpAdapter,
  RevokePrimaryMarketFactoryRoleTransactionHttpAdapter,
  GetPrimaryMarketFactoryUserRolesHttpAdapter,
  GetSubscriptionHttpAdapter,
  GetPrimaryMarketHttpAdapter,
  GetPrimaryMarketsHttpAdapter,
  GetPrimaryMarketBondsHttpAdapter,
  GetPrimaryMarketBondOfferingsHttpAdapter,
  GetSubscriptionsHttpAdapter,
  GetSubscriptionsByInvestorHttpAdapter,
  GetRoleMembersHttpAdapter,
  GetOfferingHttpAdapter,
]
export const PROVIDERS = [
  ...REPOSITORIES,
  ...COMMON_FUNCTIONALITY_PROVIDERS,
  DatabaseSeederService,
  CreateOfferingTransactionAppService,
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
  CheckPrimaryMarketExistsDomainService,
  CreateOfferingNestJSEventAdapter,
  GrantRoleNestJSEventAdapter,
  RenounceRoleNestJSEventAdapter,
  ApplyRolesNestJSEventAdapter,
  SubmitSubscriptionNestJSEventAdapter,
  CancelSubscriptionNestJSEventAdapter,
  PausePrimaryMarketNestJSEventAdapter,
  UnpausePrimaryMarketNestJSEventAdapter,
  CreateOfferingCommandHandler,
  CancelOfferingCommandHandler,
  ExecuteOfferingCommandHandler,
  SubmitSubscriptionCommandHandler,
  CancelSubscriptionCommandHandler,
  PausePrimaryMarketCommandHandler,
  UnpausePrimaryMarketCommandHandler,
  PausePrimaryMarketFactoryCommandHandler,
  UnpausePrimaryMarketFactoryCommandHandler,
  PausePrimaryMarketFactoryNestJSEventAdapter,
  UnpausePrimaryMarketFactoryNestJSEventAdapter,
  GetSubscriptionQueryHandler,
  GetSubscriptionsQueryHandler,
  CancelOfferingTransactionAppService,
  ExecuteOfferingTransactionAppService,
  ExecuteOfferingNestJSEventAdapter,
  CancelOfferingNestJSEventAdapter,
  GetPrimaryMarketQueryHandler,
  GetPrimaryMarketsQueryHandler,
  GetPrimaryMarketBondsQueryHandler,
  GetPrimaryMarketBondOfferingsQueryHandler,
  GetSubscriptionsByInvestorQueryHandler,
  GetOfferingQueryHandler,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
  {
    provide: "BlockchainAdapterPort",
    useClass: BlockchainAdapter,
  },
  {
    provide: "TransactionManager",
    useClass: TypeOrmTransactionManager,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  OfferingPersistence,
  PrimaryMarketPersistence,
  SubscriptionPersistence,
  UserRolePersistence,
  PrimaryMarketFactoryPersistence,
]
