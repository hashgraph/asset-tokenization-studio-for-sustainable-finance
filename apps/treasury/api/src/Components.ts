// SPDX-License-Identifier: Apache-2.0

import { FundProceedsRecipientTransactionHttpAdapter } from "@port/transaction/usecase/fundproceedsrecipienttransaction/FundProceedsRecipientTransactionHttpAdapter"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { AddEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionHttpAdapter"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { RemoveEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetTransactionHttpAdapter"
import { RemoveEnvironmentalAssetTransactionAppService } from "@app/transaction/removeenvironmentalasset/service/RemoveEnvironmentalAssetTransactionAppService"
import { TransferEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/transferenvironmentalasset/TransferEnvironmentalAssetTransactionHttpAdapter"
import { TransferEnvironmentalAssetTransactionAppService } from "@app/transaction/transferenvironmentalasset/service/TransferEnvironmentalAssetTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { Provider } from "@nestjs/common"
import { TreasuryTypeOrmRepository } from "@port/persistence/treasury/repositories/TreasuryTypeOrmRepository"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"
import { AddEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/AddEnvironmentalAssetDomainService"
import { RemoveEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetDomainService"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { EnvironmentalAssetTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTypeOrmRepository"
import { AddEnvironmentalAssetCommandHandler } from "@app/environmentalasset/addenvironmentalasset/command/AddEnvironmentalAssetCommandHandler"
import { RemoveEnvironmentalAssetCommandHandler } from "@app/environmentalasset/removeenvironmentalasset/command/RemoveEnvironmentalAssetCommandHandler"
import { AddEnvironmentalAssetNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalasset/AddEnvironmentalAssetNestJSEventAdapter"
import { RemoveEnvironmentalAssetNestJSEventAdapter } from "@port/environmentalasset/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetNestJSEventAdapter"
import { PaymentTokenTypeOrmRepository } from "@port/persistence/paymenttoken/repositories/PaymentTokenTypeOrmRepository"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { HederMirrorNodeAdapter } from "@port/blockchain/HederMirrorNodeAdapter"
import { GetTreasuryHttpAdapter } from "@port/treasury/usecase/gettreasury/GetTreasuryHttpAdapter"
import { GetTreasuryAppService } from "@app/treasury/gettreasury/service/GetTreasuryAppService"
import { GetTreasuryQueryHandler } from "@app/treasury/gettreasury/query/GetTreasuryQueryHandler"

import { GetEnvironmentalAssetsHttpAdapter } from "@port/environmentalasset/usecase/getenvironmentalassets/GetEnvironmentalAssetsHttpAdapter"
import { GetEnvironmentalAssetsQueryHandler } from "@app/environmentalasset/getenvironmentalassets/query/GetEnvironmentalAssetsQueryHandler"
import { GetEnvironmentalAssetTransfersHttpAdapter } from "@port/environmentalasset/usecase/getenvironmentalassettransfers/GetEnvironmentalAssetTransfersHttpAdapter"
import { GetEnvironmentalAssetTransfersQueryHandler } from "@app/environmentalasset/getenvironmentalassettransfers/query/GetEnvironmentalAssetTransfersQueryHandler"
import { GetEnvironmentalAssetHoldingsHttpAdapter } from "@port/environmentalasset/usecase/getenvironmentalassetholdings/GetEnvironmentalAssetHoldingsHttpAdapter"
import { GetEnvironmentalAssetHoldingsQueryHandler } from "@app/environmentalasset/getenvironmentalassetholdings/query/GetEnvironmentalAssetHoldingsQueryHandler"
import { EnvironmentalAssetTokenTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTokenTypeOrmRepository"
import { EnvironmentalAssetTokenPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenPersistence"
import { EnvironmentalAssetTransferTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTransferTypeOrmRepository"
import { EnvironmentalAssetTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTransferPersistence"
import { AddEnvironmentalAssetTransferAppService } from "@app/environmentalasset/addenvironmentalassettransfer/service/AddEnvironmentalAssetTransferAppService"
import { AddEnvironmentalAssetTransferCommandHandler } from "@app/environmentalasset/addenvironmentalassettransfer/command/AddEnvironmentalAssetTransferCommandHandler"
import { AddEnvironmentalAssetTransferNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalassettransfer/AddEnvironmentalAssetTransferNestJSEventAdapter"

const REPOSITORIES: Provider[] = [
  {
    provide: "TreasuryRepository",
    useClass: TreasuryTypeOrmRepository,
  },
  {
    provide: "EnvironmentalAssetRepository",
    useClass: EnvironmentalAssetTypeOrmRepository,
  },
  {
    provide: "EnvironmentalAssetTokenRepository",
    useClass: EnvironmentalAssetTokenTypeOrmRepository,
  },
  {
    provide: "EnvironmentalAssetTransferRepository",
    useClass: EnvironmentalAssetTransferTypeOrmRepository,
  },
  {
    provide: "PaymentTokenRepository",
    useClass: PaymentTokenTypeOrmRepository,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  TreasuryPersistence,
  EnvironmentalAssetPersistence,
  EnvironmentalAssetTokenPersistence,
  EnvironmentalAssetTransferPersistence,
  PaymentTokenPersistence,
]

export const CONTROLLERS = [
  FundProceedsRecipientTransactionHttpAdapter,
  AddEnvironmentalAssetTransactionHttpAdapter,
  RemoveEnvironmentalAssetTransactionHttpAdapter,
  TransferEnvironmentalAssetTransactionHttpAdapter,
  GetEnvironmentalAssetsHttpAdapter,
  GetEnvironmentalAssetTransfersHttpAdapter,
  GetTreasuryHttpAdapter,
  GetEnvironmentalAssetHoldingsHttpAdapter,
]

export const PROVIDERS = [
  ...REPOSITORIES,
  FundProceedsRecipientTransactionAppService,
  AddEnvironmentalAssetTransactionAppService,
  RemoveEnvironmentalAssetTransactionAppService,
  TransferEnvironmentalAssetTransactionAppService,
  CheckTreasuryExistsDomainService,
  CheckEnvironmentalAssetExistsDomainService,
  CheckEnvironmentalAssetNotExistsDomainService,
  AddEnvironmentalAssetDomainService,
  RemoveEnvironmentalAssetDomainService,
  AddEnvironmentalAssetCommandHandler,
  RemoveEnvironmentalAssetCommandHandler,
  AddEnvironmentalAssetNestJSEventAdapter,
  RemoveEnvironmentalAssetNestJSEventAdapter,
  GetTreasuryAppService,
  GetTreasuryQueryHandler,
  AddEnvironmentalAssetTransferAppService,
  AddEnvironmentalAssetTransferCommandHandler,
  AddEnvironmentalAssetTransferNestJSEventAdapter,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
  GetEnvironmentalAssetsQueryHandler,
  GetEnvironmentalAssetTransfersQueryHandler,
  GetEnvironmentalAssetHoldingsQueryHandler,
  {
    provide: "HederaPort",
    useClass: HederMirrorNodeAdapter,
  },
]
