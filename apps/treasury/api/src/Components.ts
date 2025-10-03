// SPDX-License-Identifier: Apache-2.0

import { FundProceedsRecipientTransactionHttpAdapter } from "@port/transaction/usecase/fundproceedsrecipienttransaction/FundProceedsRecipientTransactionHttpAdapter"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { Provider } from "@nestjs/common"
import { TreasuryTypeOrmRepository } from "@port/persistence/treasury/repositories/TreasuryTypeOrmRepository"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { UpdateTreasuryBalanceCommandHandler } from "@app/treasury/updatetreasurybalance/command/UpdateTreasuryBalanceCommandHandler"
import { UpdateTreasuryBalanceDomainService } from "@domain/treasury/services/UpdateTreasuryBalanceDomainService"
import { UpdateTreasuryBalanceNestJSEventAdapter } from "@port/treasury/usecase/updatetreasurybalance/UpdateTreasuryBalanceNestJSEventAdapter"

const REPOSITORIES: Provider[] = [
  {
    provide: "TreasuryRepository",
    useClass: TreasuryTypeOrmRepository,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, TreasuryPersistence]

export const CONTROLLERS = [FundProceedsRecipientTransactionHttpAdapter]

export const PROVIDERS = [
  ...REPOSITORIES,
  FundProceedsRecipientTransactionAppService,
  UpdateTreasuryBalanceDomainService,
  UpdateTreasuryBalanceCommandHandler,
  UpdateTreasuryBalanceNestJSEventAdapter,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]
