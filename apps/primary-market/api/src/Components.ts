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
import { CreateOfferingDomainService } from "@domain/offering/services/CreateOfferingDomainService"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import { CreateOfferingNestJSEventAdapter } from "@port/offering/usecase/createoffering/CreateOfferingNestJSEventAdapter"
import { CreateOfferingCommandHandler } from "@app/offering/createoffering/command/CreateOfferingCommandHandler"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"

const REPOSITORIES: Provider[] = [
  {
    provide: "PrimaryMarketRepository",
    useClass: PrimaryMarketTypeORMRepository,
  },
  {
    provide: "OfferingRepository",
    useClass: OfferingTypeORMRepository,
  },
]

export const CONTROLLERS = [AppController, CreateOfferingTransactionHttpAdapter, GrantRoleTransactionHttpAdapter]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
  CreateOfferingTransactionAppService,
  GrantRoleTransactionAppService,
  CreateOfferingDomainService,
  CheckPrimaryMarketExistsDomainService,
  CreateOfferingNestJSEventAdapter,
  CreateOfferingCommandHandler,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, OfferingPersistence, PrimaryMarketPersistence]
