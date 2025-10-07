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
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"
import { AddEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/AddEnvironmentalAssetDomainService"
import { RemoveEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetDomainService"
import { GetTreasuryPositionsQueryHandler } from "@app/treasury/gettreasurypositions/query/GetTreasuryPositionsQueryHandler"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { EnvironmentalAssetTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTypeOrmRepository"
import { AddEnvironmentalAssetCommandHandler } from "@app/environmentalasset/addenvironmentalasset/command/AddEnvironmentalAssetCommandHandler"
import { RemoveEnvironmentalAssetCommandHandler } from "@app/environmentalasset/removeenvironmentalasset/command/RemoveEnvironmentalAssetCommandHandler"
import { AddEnvironmentalAssetNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalasset/AddEnvironmentalAssetNestJSEventAdapter"
import { RemoveEnvironmentalAssetNestJSEventAdapter } from "@port/environmentalasset/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetNestJSEventAdapter"

const REPOSITORIES: Provider[] = [
  {
    provide: "TreasuryRepository",
    useClass: TreasuryTypeOrmRepository,
  },
  {
    provide: "EnvironmentalAssetRepository",
    useClass: EnvironmentalAssetTypeOrmRepository,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, TreasuryPersistence, EnvironmentalAssetPersistence]

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
  CheckEnvironmentalAssetExistsDomainService,
  CheckEnvironmentalAssetNotExistsDomainService,
  AddEnvironmentalAssetDomainService,
  RemoveEnvironmentalAssetDomainService,
  GetTreasuryPositionsQueryHandler,
  AddEnvironmentalAssetCommandHandler,
  RemoveEnvironmentalAssetCommandHandler,
  AddEnvironmentalAssetNestJSEventAdapter,
  RemoveEnvironmentalAssetNestJSEventAdapter,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]
