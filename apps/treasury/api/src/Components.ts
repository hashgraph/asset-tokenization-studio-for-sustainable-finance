// SPDX-License-Identifier: Apache-2.0

import { FundProceedsRecipientTransactionHttpAdapter } from "@port/transaction/usecase/fundproceedsrecipient/FundProceedsRecipientTransactionHttpAdapter"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { AddEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/addenvironmentalasset/AddEnvironmentalAssetTransactionHttpAdapter"
import { AddEnvironmentalAssetTransactionAppService } from "@app/transaction/addenvironmentalasset/service/AddEnvironmentalAssetTransactionAppService"
import { RemoveEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/removeenvironmentalasset/RemoveEnvironmentalAssetTransactionHttpAdapter"
import { RemoveEnvironmentalAssetTransactionAppService } from "@app/transaction/removeenvironmentalasset/service/RemoveEnvironmentalAssetTransactionAppService"
import { TransferEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/transferenvironmentalasset/TransferEnvironmentalAssetTransactionHttpAdapter"
import { TransferEnvironmentalAssetTransactionAppService } from "@app/transaction/transferenvironmentalasset/service/TransferEnvironmentalAssetTransactionAppService"
import { TransferPaymentTokenTransactionHttpAdapter } from "@port/transaction/usecase/transferpaymenttoken/TransferPaymentTokenTransactionHttpAdapter"
import { TransferPaymentTokenTransactionAppService } from "@app/transaction/transferpaymenttoken/service/TransferPaymentTokenTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { Provider } from "@nestjs/common"
import { TreasuryTypeOrmRepository } from "@port/persistence/treasury/repositories/TreasuryTypeOrmRepository"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"
import { CheckEnvironmentalAssetTokenExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenExistsDomainService"
import { CheckEnvironmentalAssetTokenNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenNotExistsDomainService"
import { CheckPaymentTokenExistsDomainService } from "@domain/paymenttoken/services/CheckPaymentTokenExistsDomainService"
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
import { GetPaymentTokenTransfersHttpAdapter } from "@port/paymenttoken/usecase/getpaymenttokentransfers/GetPaymentTokenTransfersHttpAdapter"
import { GetPaymentTokenTransfersQueryHandler } from "@app/paymenttoken/getpaymenttokentransfers/query/GetPaymentTokenTransfersQueryHandler"
import { EnvironmentalAssetTokenTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTokenTypeOrmRepository"
import { EnvironmentalAssetTokenPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenPersistence"
import { EnvironmentalAssetTransferTypeOrmRepository } from "@port/persistence/environmentalasset/repositories/EnvironmentalAssetTransferTypeOrmRepository"
import { EnvironmentalAssetTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTransferPersistence"
import { PaymentTokenTransferTypeOrmRepository } from "@port/persistence/paymenttoken/repositories/PaymentTokenTransferTypeOrmRepository"
import { PaymentTokenTransferPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenTransferPersistence"
import { AddEnvironmentalAssetTransferAppService } from "@app/environmentalasset/addenvironmentalassettransfer/service/AddEnvironmentalAssetTransferAppService"
import { AddEnvironmentalAssetTransferCommandHandler } from "@app/environmentalasset/addenvironmentalassettransfer/command/AddEnvironmentalAssetTransferCommandHandler"
import { AddEnvironmentalAssetTransferNestJSEventAdapter } from "@port/environmentalasset/usecase/addenvironmentalassettransfer/AddEnvironmentalAssetTransferNestJSEventAdapter"
import { SyncEnvironmentalAssetTokenAppService } from "@app/environmentalasset/syncenvironmentalassettoken/service/SyncEnvironmentalAssetTokenAppService"
import { SyncEnvironmentalAssetTokenNestJSEventAdapter } from "@port/environmentalasset/usecase/syncenvironmentalassettoken/SyncEnvironmentalAssetTokenNestJSEventAdapter"
import { AddEnvironmentalAssetTokenCommandHandler } from "@app/environmentalasset/addenvironmentalassettoken/command/AddEnvironmentalAssetTokenCommandHandler"
import { RemoveEnvironmentalAssetTokenCommandHandler } from "@app/environmentalasset/removeenvironmentalassettoken/command/RemoveEnvironmentalAssetTokenCommandHandler"
import { ExternalTransferPaymentTokenTransactionHttpAdapter } from "@port/transaction/usecase/externaltransferpaymenttoken/ExternalTransferPaymentTokenTransactionHttpAdapter"
import { ExternalTransferPaymentTokenTransactionAppService } from "@app/transaction/externaltransferpaymenttoken/service/ExternalTransferPaymentTokenTransactionAppService"
import { UpdatePaymentTokenTransactionHttpAdapter } from "@port/transaction/usecase/updatepaymenttoken/UpdatePaymentTokenTransactionHttpAdapter"
import { UpdatePaymentTokenTransactionAppService } from "@app/transaction/updatepaymenttoken/service/UpdatePaymentTokenTransactionAppService"
import { ExternalTransferEnvironmentalAssetTransactionAppService } from "@app/transaction/externaltransferenvironmentalasset/service/service/ExternalTransferEnvironmentalAssetTransactionAppService"
import { ExternalTransferEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/externaltransferenvironmentalasset/ExternalTransferEnvironmentalAssetTransactionHttpAdapter"
import { UpdatePaymentTokenNestJSEventAdapter } from "@port/treasury/usecase/updatepaymenttoken/UpdatePaymentTokenNestJSEventAdapter"
import { UpdatePaymentTokenCommandHandler } from "@app/treasury/updatepaymenttoken/command/UpdatePaymentTokenCommandHandler"
import { UpdatePaymentTokenDomainService } from "@domain/treasury/services/UpdatePaymentTokenDomainService"
import { TypeOrmTransactionManager } from "@hashgraph/green-bonds-shared-core"
import { GetPaymentTokensHttpAdapter } from "@port/paymenttoken/usecase/getpaymenttokens/GetPaymentTokensHttpAdapter"
import { GetPaymentTokensQueryHandler } from "@app/paymenttoken/getpaymenttokens/query/GetPaymentTokensQueryHandler"
import { AddPaymentTokenTransferNestJSEventAdapter } from "@port/treasury/usecase/addpaymenttokentransfer/AddPaymentTokenTransferNestJSEventAdapter"
import { AddPaymentTokenTransferCommandHandler } from "@app/treasury/addpaymenttokentransfer/command/AddPaymentTokenTransferCommandHandler"
import { AddPaymentTokenTransferAppService } from "@app/treasury/addpaymenttokentransfer/service/AddPaymentTokenTransferAppService"
import { PauseTreasuryTransactionHttpAdapter } from "@port/transaction/usecase/pausetreasury/PauseTreasuryTransactionHttpAdapter"
import { PauseTreasuryTransactionAppService } from "@app/transaction/pausetreasury/service/PauseTreasuryTransactionAppService"
import { UnpauseTreasuryTransactionHttpAdapter } from "@port/transaction/usecase/unpausetreasury/UnpauseTreasuryTransactionHttpAdapter"
import { UnpauseTreasuryTransactionAppService } from "@app/transaction/unpausetreasury/service/UnpauseTreasuryTransactionAppService"

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
  {
    provide: "PaymentTokenTransferRepository",
    useClass: PaymentTokenTransferTypeOrmRepository,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  TreasuryPersistence,
  EnvironmentalAssetPersistence,
  EnvironmentalAssetTokenPersistence,
  EnvironmentalAssetTransferPersistence,
  PaymentTokenPersistence,
  PaymentTokenTransferPersistence,
]

export const CONTROLLERS = [
  FundProceedsRecipientTransactionHttpAdapter,
  AddEnvironmentalAssetTransactionHttpAdapter,
  RemoveEnvironmentalAssetTransactionHttpAdapter,
  TransferEnvironmentalAssetTransactionHttpAdapter,
  TransferPaymentTokenTransactionHttpAdapter,
  GetEnvironmentalAssetsHttpAdapter,
  GetEnvironmentalAssetTransfersHttpAdapter,
  GetTreasuryHttpAdapter,
  GetEnvironmentalAssetHoldingsHttpAdapter,
  ExternalTransferPaymentTokenTransactionHttpAdapter,
  UpdatePaymentTokenTransactionHttpAdapter,
  ExternalTransferEnvironmentalAssetTransactionHttpAdapter,
  GetPaymentTokensHttpAdapter,
  UnpauseTreasuryTransactionHttpAdapter,
  GetPaymentTokenTransfersHttpAdapter,
  PauseTreasuryTransactionHttpAdapter,
]

export const PROVIDERS = [
  ...REPOSITORIES,
  FundProceedsRecipientTransactionAppService,
  AddEnvironmentalAssetTransactionAppService,
  RemoveEnvironmentalAssetTransactionAppService,
  TransferEnvironmentalAssetTransactionAppService,
  TransferPaymentTokenTransactionAppService,
  CheckTreasuryExistsDomainService,
  CheckEnvironmentalAssetExistsDomainService,
  CheckEnvironmentalAssetNotExistsDomainService,
  CheckEnvironmentalAssetTokenExistsDomainService,
  CheckEnvironmentalAssetTokenNotExistsDomainService,
  CheckPaymentTokenExistsDomainService,
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
  SyncEnvironmentalAssetTokenAppService,
  SyncEnvironmentalAssetTokenNestJSEventAdapter,
  AddEnvironmentalAssetTokenCommandHandler,
  RemoveEnvironmentalAssetTokenCommandHandler,
  ExternalTransferPaymentTokenTransactionAppService,
  UpdatePaymentTokenTransactionAppService,
  UpdatePaymentTokenNestJSEventAdapter,
  UpdatePaymentTokenCommandHandler,
  UpdatePaymentTokenDomainService,
  AddPaymentTokenTransferNestJSEventAdapter,
  AddPaymentTokenTransferCommandHandler,
  UnpauseTreasuryTransactionAppService,
  AddPaymentTokenTransferAppService,
  ExternalTransferEnvironmentalAssetTransactionAppService,
  PauseTreasuryTransactionAppService,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
  GetEnvironmentalAssetsQueryHandler,
  GetEnvironmentalAssetTransfersQueryHandler,
  GetEnvironmentalAssetHoldingsQueryHandler,
  GetPaymentTokensQueryHandler,
  GetPaymentTokenTransfersQueryHandler,
  {
    provide: "HederaPort",
    useClass: HederMirrorNodeAdapter,
  },
  {
    provide: "TransactionManager",
    useClass: TypeOrmTransactionManager,
  },
]
