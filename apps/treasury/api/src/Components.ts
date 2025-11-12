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
import { AddPaymentTokenDomainService } from "@domain/paymenttoken/services/AddPaymentTokenDomainService"
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
import { GetTreasuryQueryHandler } from "@app/treasury/gettreasury/query/GetTreasuryQueryHandler"
import { GetTreasuriesHttpAdapter } from "@port/treasury/usecase/gettreasuries/GetTreasuriesHttpAdapter"
import { GetTreasuriesQueryHandler } from "@app/treasury/gettreasuries/query/GetTreasuriesQueryHandler"

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
import {
  COMMON_FUNCTIONALITY_ENTITIES,
  COMMON_FUNCTIONALITY_PROVIDERS,
  TypeOrmTransactionManager,
} from "@hashgraph/green-bonds-shared-core"
import { GetPaymentTokensHttpAdapter } from "@port/paymenttoken/usecase/getpaymenttokens/GetPaymentTokensHttpAdapter"
import { GetPaymentTokensQueryHandler } from "@app/paymenttoken/getpaymenttokens/query/GetPaymentTokensQueryHandler"
import { AddPaymentTokenTransferNestJSEventAdapter } from "@port/treasury/usecase/addpaymenttokentransfer/AddPaymentTokenTransferNestJSEventAdapter"
import { AddPaymentTokenTransferCommandHandler } from "@app/treasury/addpaymenttokentransfer/command/AddPaymentTokenTransferCommandHandler"
import { AddPaymentTokenTransferAppService } from "@app/treasury/addpaymenttokentransfer/service/AddPaymentTokenTransferAppService"
import { PauseTreasuryTransactionHttpAdapter } from "@port/transaction/usecase/pausetreasury/PauseTreasuryTransactionHttpAdapter"
import { UnpauseTreasuryTransactionHttpAdapter } from "@port/transaction/usecase/unpausetreasury/UnpauseTreasuryTransactionHttpAdapter"
import { PauseTreasuryNestJSEventAdapter } from "@port/treasury/usecase/pausetreasury/PauseTreasuryNestJSEventAdapter"
import { PauseTreasuryCommandHandler } from "@app/treasury/pausetreasury/command/PauseTreasuryCommandHandler"
import { UnpauseTreasuryNestJSEventAdapter } from "@port/treasury/usecase/unpausetreasury/UnpauseTreasuryNestJSEventAdapter"
import { UnpauseTreasuryCommandHandler } from "@app/treasury/unpausetreasury/command/UnpauseTreasuryCommandHandler"
import { ProceedsRecipientTypeOrmRepository } from "@port/persistence/proceedsrecipient/repositories/ProceedsRecipientTypeOrmRepository"
import { ProceedsRecipientAllocationTypeOrmRepository } from "@port/persistence/proceedsrecipient/repositories/ProceedsRecipientAllocationTypeOrmRepository"
import { ProceedsRecipientPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientPersistence"
import { ProceedsRecipientAllocationPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientAllocationPersistence"
import { SyncProceedsRecipientNestJSEventAdapter } from "@port/proceedsrecipient/usecase/syncproceedsrecipient/SyncProceedsRecipientNestJSEventAdapter"
import { SyncProceedsRecipientAppService } from "@app/proceedsrecipient/syncproceedsrecipient/service/SyncProceedsRecipientAppService"
import { CreateProceedsRecipientCommandHandler } from "@app/proceedsrecipient/createproceedsrecipient/command/CreateProceedsRecipientCommandHandler"
import { AddProceedsRecipientAllocationCommandHandler } from "@app/proceedsrecipient/addproceedsrecipientallocation/command/AddProceedsRecipientAllocationCommandHandler"
import { GetProceedsRecipientAllocationsHttpAdapter } from "@port/proceedsrecipient/usecase/getproceedsrecipientallocations/GetProceedsRecipientAllocationsHttpAdapter"
import { GetProceedsRecipientAllocationsQueryHandler } from "@app/proceedsrecipient/getproceedsrecipientallocations/query/GetProceedsRecipientAllocationsQueryHandler"
import { GetProceedsRecipientsHttpAdapter } from "@port/proceedsrecipient/usecase/getproceedsrecipients/GetProceedsRecipientsHttpAdapter"
import { GetProceedsRecipientsQueryHandler } from "@app/proceedsrecipient/getproceedsrecipients/query/GetProceedsRecipientsQueryHandler"
import { CheckProceedsRecipientExistsDomainService } from "@domain/proceedsrecipient/services/CheckProceedsRecipientExistsDomainService"
import { DistributionTypeOrmRepository } from "@port/persistence/distribution/repositories/DistributionTypeOrmRepository"
import { DistributionHolderTypeOrmRepository } from "@port/persistence/distribution/repositories/DistributionHolderTypeOrmRepository"
import { DistributionPersistence } from "@port/persistence/distribution/model/DistributionPersistence"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"
import { RedemptionHolderTypeOrmRepository } from "@port/persistence/redemption/repositories/RedemptionHolderTypeOrmRepository"
import { RedemptionHolderPersistence } from "@port/persistence/redemption/model/RedemptionHolderPersistence"
import { GetDistributionsHttpAdapter } from "@port/distribution/usecase/getdistributions/GetDistributionsHttpAdapter"
import { GetDistributionsQueryHandler } from "@app/distribution/getdistributions/query/GetDistributionsQueryHandler"
import { SyncDistributionNestJSEventAdapter } from "@port/distribution/usecase/syncdistribution/SyncDistributionNestJSEventAdapter"
import { SyncDistributionAppService } from "@app/distribution/syncdistribution/service/SyncDistributionAppService"
import { CreateDistributionCommandHandler } from "@app/distribution/createdistribution/command/CreateDistributionCommandHandler"
import { AddDistributionHolderCommandHandler } from "@app/distribution/adddistributionholder/command/AddDistributionHolderCommandHandler"
import { ExecuteDistributionTransactionAppService } from "@app/transaction/executedistribution/ExecuteDistributionTransactionAppService"
import { ExecuteDistributionTransactionHttpAdapter } from "@port/transaction/usecase/executedistribution/ExecuteDistributionTransactionHttpAdapter"
import { GetDistributionHoldersQueryHandler } from "@app/distribution/getdistributionholders/query/GetDistributionHoldersQueryHandler"
import { CheckDistributionExistsDomainService } from "@domain/distribution/services/CheckDistributionExistsDomainService"
import { GetDistributionHoldersHttpAdapter } from "@port/distribution/usecase/getdistributionholders/GetDistributionHoldersHttpAdapter"
import { ExecuteDistributionByAddressesTransactionHttpAdapter } from "@port/transaction/usecase/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionHttpAdapter"
import { ExecuteDistributionByAddressesTransactionAppService } from "@app/transaction/executedistributionbyaddresses/ExecuteDistributionByAddressesTransactionAppService"
import { DissociatePaymentTokenTransactionHttpAdapter } from "@port/transaction/usecase/dissociatepaymenttoken/DissociatePaymentTokenTransactionHttpAdapter"
import { DissociatePaymentTokenTransactionAppService } from "@app/transaction/dissociatepaymenttoken/DissociatePaymentTokenTransactionAppService"
import { DissociateEnvironmentalAssetTransactionHttpAdapter } from "@port/transaction/usecase/dissociateenvironmentalasset/DissociateEnvironmentalAssetTransactionHttpAdapter"
import { DissociateEnvironmentalAssetTransactionAppService } from "@app/transaction/dissociateenvironmentalasset/DissociateEnvironmentalAssetTransactionAppService"
import { ExecuteRedemptionTransactionHttpAdapter } from "@port/transaction/usecase/executeredemption/ExecuteRedemptionTransactionHttpAdapter"
import { ExecuteRedemptionTransactionAppService } from "@app/transaction/executeredemption/ExecuteRedemptionTransactionAppService"
import { ExecuteRedemptionByAddressesTransactionHttpAdapter } from "@port/transaction/usecase/executeredemptionbyaddresses/ExecuteRedemptionByAddressesTransactionHttpAdapter"
import { ExecuteRedemptionByAddressesTransactionAppService } from "@app/transaction/executeredemptionbyaddresses/ExecuteRedemptionByAddressesTransactionAppService"
import { GetRedemptionHoldersQueryHandler } from "@app/redemption/getredemptionholders/query/GetRedemptionHoldersQueryHandler"
import { GetRedemptionHoldersHttpAdapter } from "@port/redemption/usecase/getredemptionholders/GetRedemptionHoldersHttpAdapter"
import { SyncRedemptionNestJSEventAdapter } from "@port/redemption/usecase/syncredemption/SyncRedemptionNestJSEventAdapter"
import { SyncRedemptionAppService } from "@app/redemption/syncredemption/SyncRedemptionAppService"
import { AddRedemptionHolderCommandHandler } from "@app/redemption/addredemptionholder/AddRedemptionHolderCommandHandler"
import { SyncTokenDissociationErrorNestJSEventAdapter } from "@port/treasury/usecase/synctokendissociationerror/SyncTokenDissociationErrorNestJSEventAdapter"
import { SyncTokenDissociationErrorAppService } from "@app/treasury/synctokendissociationerror/service/SyncTokenDissociationErrorAppService"
import { UpdatePaymentTokenDissociationErrorCommandHandler } from "@app/paymenttoken/updatepaymenttokendissociationerror/command/UpdatePaymentTokenDissociationErrorCommandHandler"
import { UpdateEnvironmentalAssetDissociationErrorCommandHandler } from "@app/environmentalasset/updateenvironmentalassetdissociationerror/UpdateEnvironmentalAssetDissociationErrorCommandHandler"
import { SyncTreasuryNestJSEventAdapter } from "@port/treasury/usecase/synctreasury/SyncTreasuryNestJSEventAdapter"
import { SyncTreasuryAppService } from "@app/treasury/synctreasury/service/SyncTreasuryAppService"
import { CreateTreasuryCommandHandler } from "@app/treasury/createtreasury/command/CreateTreasuryCommandHandler"
import { AddPaymentTokenCommandHandler } from "@app/treasury/addpaymenttoken/command/AddPaymentTokenCommandHandler"
import { CreateTreasuryFiltersNestJSEventAdapter } from "@port/treasury/usecase/createtreasuryfilters/CreateTreasuryFiltersNestJSEventAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter"
import { RevokeRoleTransactionHttpAdapter } from "@port/transaction/usecase/revokerole/RevokeRoleTransactionHttpAdapter"
import { RenounceRoleTransactionHttpAdapter } from "@port/transaction/usecase/renouncerole/RenounceRoleTransactionHttpAdapter"
import { GetUserRolesHttpAdapter } from "@port/treasury/usecase/getuserroles/GetUserRolesHttpAdapter"
import { GetRoleMembersHttpAdapter } from "@port/treasury/usecase/getrolemembers/GetRoleMembersHttpAdapter"

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
  {
    provide: "ProceedsRecipientRepository",
    useClass: ProceedsRecipientTypeOrmRepository,
  },
  {
    provide: "DistributionRepository",
    useClass: DistributionTypeOrmRepository,
  },
  {
    provide: "DistributionHolderRepository",
    useClass: DistributionHolderTypeOrmRepository,
  },
  {
    provide: "RedemptionHolderRepository",
    useClass: RedemptionHolderTypeOrmRepository,
  },
  {
    provide: "ProceedsRecipientAllocationRepository",
    useClass: ProceedsRecipientAllocationTypeOrmRepository,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  ...COMMON_FUNCTIONALITY_ENTITIES,
  TreasuryPersistence,
  EnvironmentalAssetPersistence,
  EnvironmentalAssetTokenPersistence,
  EnvironmentalAssetTransferPersistence,
  PaymentTokenPersistence,
  PaymentTokenTransferPersistence,
  ProceedsRecipientPersistence,
  ProceedsRecipientAllocationPersistence,
  DistributionPersistence,
  DistributionHolderPersistence,
  RedemptionHolderPersistence,
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
  GetTreasuriesHttpAdapter,
  GetEnvironmentalAssetHoldingsHttpAdapter,
  ExternalTransferPaymentTokenTransactionHttpAdapter,
  UpdatePaymentTokenTransactionHttpAdapter,
  ExternalTransferEnvironmentalAssetTransactionHttpAdapter,
  GetPaymentTokensHttpAdapter,
  UnpauseTreasuryTransactionHttpAdapter,
  GetPaymentTokenTransfersHttpAdapter,
  PauseTreasuryTransactionHttpAdapter,
  GetProceedsRecipientAllocationsHttpAdapter,
  GetProceedsRecipientsHttpAdapter,
  GetDistributionsHttpAdapter,
  ExecuteDistributionTransactionHttpAdapter,
  GetDistributionHoldersHttpAdapter,
  ExecuteDistributionByAddressesTransactionHttpAdapter,
  DissociatePaymentTokenTransactionHttpAdapter,
  DissociateEnvironmentalAssetTransactionHttpAdapter,
  ExecuteRedemptionTransactionHttpAdapter,
  ExecuteRedemptionByAddressesTransactionHttpAdapter,
  GetRedemptionHoldersHttpAdapter,
  GrantRoleTransactionHttpAdapter,
  RevokeRoleTransactionHttpAdapter,
  RenounceRoleTransactionHttpAdapter,
  GetUserRolesHttpAdapter,
  GetRoleMembersHttpAdapter
]

export const PROVIDERS = [
  ...REPOSITORIES,
  ...COMMON_FUNCTIONALITY_PROVIDERS,
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
  AddPaymentTokenDomainService,
  AddEnvironmentalAssetDomainService,
  RemoveEnvironmentalAssetDomainService,
  CheckProceedsRecipientExistsDomainService,
  CheckDistributionExistsDomainService,
  AddEnvironmentalAssetCommandHandler,
  RemoveEnvironmentalAssetCommandHandler,
  AddEnvironmentalAssetNestJSEventAdapter,
  RemoveEnvironmentalAssetNestJSEventAdapter,
  GetTreasuryQueryHandler,
  GetTreasuriesQueryHandler,
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
  AddPaymentTokenTransferAppService,
  ExternalTransferEnvironmentalAssetTransactionAppService,
  PauseTreasuryNestJSEventAdapter,
  PauseTreasuryCommandHandler,
  UnpauseTreasuryNestJSEventAdapter,
  UnpauseTreasuryCommandHandler,
  SyncProceedsRecipientNestJSEventAdapter,
  SyncProceedsRecipientAppService,
  CreateProceedsRecipientCommandHandler,
  AddProceedsRecipientAllocationCommandHandler,
  SyncDistributionNestJSEventAdapter,
  SyncDistributionAppService,
  CreateDistributionCommandHandler,
  AddDistributionHolderCommandHandler,
  ExecuteDistributionTransactionAppService,
  GetDistributionHoldersQueryHandler,
  ExecuteDistributionByAddressesTransactionAppService,
  DissociatePaymentTokenTransactionAppService,
  DissociateEnvironmentalAssetTransactionAppService,
  ExecuteRedemptionTransactionAppService,
  ExecuteRedemptionByAddressesTransactionAppService,
  SyncRedemptionNestJSEventAdapter,
  SyncRedemptionAppService,
  AddRedemptionHolderCommandHandler,
  SyncTokenDissociationErrorNestJSEventAdapter,
  SyncTokenDissociationErrorAppService,
  UpdatePaymentTokenDissociationErrorCommandHandler,
  UpdateEnvironmentalAssetDissociationErrorCommandHandler,
  SyncTreasuryNestJSEventAdapter,
  SyncTreasuryAppService,
  CreateTreasuryCommandHandler,
  AddPaymentTokenCommandHandler,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
  GetEnvironmentalAssetsQueryHandler,
  GetEnvironmentalAssetTransfersQueryHandler,
  GetEnvironmentalAssetHoldingsQueryHandler,
  GetPaymentTokensQueryHandler,
  GetPaymentTokenTransfersQueryHandler,
  GetProceedsRecipientAllocationsQueryHandler,
  GetRedemptionHoldersQueryHandler,
  GetProceedsRecipientsQueryHandler,
  GetDistributionsQueryHandler,
  {
    provide: "HederaPort",
    useClass: HederMirrorNodeAdapter,
  },
  {
    provide: "TransactionManager",
    useClass: TypeOrmTransactionManager,
  },
  CreateTreasuryFiltersNestJSEventAdapter,
]
