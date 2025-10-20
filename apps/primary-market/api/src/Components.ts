// SPDX-License-Identifier: Apache-2.0

import { AppService } from './AppService'
import { AppController } from './AppController'
import { EVENT_LISTENER_ENTITIES } from '@hashgraph/green-bonds-blockchain-listener'
import { Provider } from '@nestjs/common'
import { CreateOfferingTransactionHttpAdapter } from '@port/transaction/usecase/createoffering/CreateOfferingTransactionHttpAdapter'
import { GrantRoleTransactionHttpAdapter } from '@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter'
import { CreateOfferingTransactionAppService } from '@app/transaction/createoffering/service/CreateOfferingTransactionAppService'
import { GrantRoleTransactionAppService } from '@app/transaction/grantrole/service/GrantRoleTransactionAppService'
import { TransactionBuilderAdapter } from '@port/transactionbuilder/TransactionBuilderAdapter'

const REPOSITORIES: Provider[] = []

export const CONTROLLERS = [AppController, CreateOfferingTransactionHttpAdapter, GrantRoleTransactionHttpAdapter]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
  CreateOfferingTransactionAppService,
  GrantRoleTransactionAppService,
  {
    provide: 'TransactionBuilderPort',
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES]
