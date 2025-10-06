// SPDX-License-Identifier: Apache-2.0

import { FundProceedsRecipientTransactionHttpAdapter } from "@port/transaction/usecase/fundproceedsrecipienttransaction/FundProceedsRecipientTransactionHttpAdapter"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { AddEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionHttpAdapter"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { RemoveEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetTransactionHttpAdapter"
import { RemoveEnvironmentalAssetTransactionAppService } from "@app/transaction/removeenvironmentalasset/service/RemoveEnvironmentalAssetTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { Provider } from "@nestjs/common"
import { TreasuryTypeOrmRepository } from "@port/persistence/treasury/repositories/TreasuryTypeOrmRepository"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { UpdateTreasuryBalanceCommandHandler } from "@app/treasury/updatetreasurybalance/command/UpdateTreasuryBalanceCommandHandler"
import { UpdateTreasuryBalanceDomainService } from "@domain/treasury/services/UpdateTreasuryBalanceDomainService"
import { UpdateTreasuryBalanceNestJSEventAdapter } from "@port/treasury/usecase/updatetreasurybalance/UpdateTreasuryBalanceNestJSEventAdapter"
import { GetTreasuryPositionsHttpAdapter } from "@port/treasury/usecase/gettreasurypositions/GetTreasuryPositionsHttpAdapter"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { GetTreasuryPositionsQueryHandler } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQueryHandler"

const REPOSITORIES: Provider[] = [
  {
    provide: "TreasuryRepository",
    useClass: TreasuryTypeOrmRepository,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, TreasuryPersistence]

export const CONTROLLERS = [
  FundProceedsRecipientTransactionHttpAdapter,
  AddEnvironmentalAssetTransactionHttpAdapter,
  RemoveEnvironmentalAssetTransactionHttpAdapter,
  GetTreasuryPositionsHttpAdapter,
]

export const PROVIDERS = [
  ...REPOSITORIES,
  FundProceedsRecipientTransactionAppService,
  AddEnvironmentalAssetTransactionAppService,
  RemoveEnvironmentalAssetTransactionAppService,
  UpdateTreasuryBalanceDomainService,
  UpdateTreasuryBalanceCommandHandler,
  UpdateTreasuryBalanceNestJSEventAdapter,
  CheckTreasuryExistsDomainService,
  GetTreasuryPositionsQueryHandler,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]
