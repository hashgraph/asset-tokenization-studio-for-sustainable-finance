import { CreateBondTransactionHttpAdapter } from "@port/transaction/usecase/createbondtransaction/CreateBondTransactionHttpAdapter"
import { CreateBondTransactionAppService } from "@app/transaction/bond/createbondtransaction/service/CreateBondTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { EVENT_LISTENER_ENTITIES } from "@hashgraph/green-bonds-blockchain-listener"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { CreateBondNestJSEventAdapter } from "@port/bond/usecase/createbond/CreateBondNestJSEventAdapter"
import { CreateBondDomainService } from "@domain/bond/services/CreateBondDomainService"
import { BondTypeOrmRepository } from "@port/bond/persistence/repositories/BondTypeOrmRepository"
import { Provider } from "@nestjs/common"
import { GetBondHttpAdapter } from "@port/bond/usecase/getbond/GetBondHttpAdapter"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { GetBondsHttpAdapter } from "@port/bond/usecase/getbonds/GetBondsHttpAdapter"
import { CreateBondCommandHandler } from "@app/bond/createbond/command/CreateBondCommandHandler"
import { GetBondQueryHandler } from "@app/bond/getbond/query/GetBondQueryHandler"
import { GetBondsQueryHandler } from "@app/bond/getbonds/query/GetBondsQueryHandler"
import { SetBondDocumentTransactionHttpAdapter } from "@port/transaction/usecase/setbonddocumenttransaction/SetBondDocumentTransactionHttpAdapter"
import { SetBondDocumentTransactionAppService } from "@app/transaction/document/setbonddocumenttransaction/service/SetBondDocumentTransactionAppService"
import { SetBondDocumentCommandHandler } from "@app/document/setbonddocument/command/SetBondDocumentCommandHandler"
import { SetBondDocumentNestJSEventAdapter } from "@port/document/usecase/setbonddocument/SetBondDocumentNestJSEventAdapter"
import { SetBondDocumentDomainService } from "@domain/document/service/SetBondDocumentDomainService"
import { BondDocumentPersistence } from "@port/document/persistence/model/BondDocumentPersistence"
import { BondDocumentTypeOrmRepository } from "@port/document/persistence/repositories/BondDocumentTypeOrmRepository"
import { CreateBondFiltersAdapter } from "@port/bond/usecase/createbondfilters/CreateBondFiltersAdapter"
import { RemoveBondDocumentTransactionHttpAdapter } from "@port/transaction/usecase/removebonddocumenttransaction/RemoveBondDocumentTransactionHttpAdapter"
import { RemoveBondDocumentTransactionAppService } from "@app/transaction/document/removebonddocumenttransaction/service/RemoveBondDocumentTransactionAppService"
import { RemoveBondDocumentCommandHandler } from "@app/document/removebonddocument/command/RemoveBondDocumentCommandHandler"
import { RemoveBondDocumentNestJSEventAdapter } from "@port/document/usecase/removebonddocument/RemoveBondDocumentNestJSEventAdapter"
import { RemoveBondDocumentDomainService } from "@domain/document/service/RemoveBondDocumentDomainService"
import { SetBondCapTransactionHttpAdapter } from "@port/transaction/usecase/setbondcaptransaction/SetBondCapTransactionHttpAdapter"
import { SetBondCapTransactionAppService } from "@app/transaction/cap/setbondcaptransaction/service/SetBondCapTransactionAppService"
import { SetBondCapCommandHandler } from "@app/cap/setbondcap/command/SetBondCapCommandHandler"
import { SetBondCapNestJSEventAdapter } from "@port/cap/usecase/setbondcap/SetBondCapNestJSEventAdapter"
import { SetBondCapDomainService } from "@domain/bond/services/cap/service/SetBondCapDomainService"
import { AddControlListMemberTransactionHttpAdapter } from "@port/transaction/usecase/addcontrollistmembertransaction/AddControlListMemberTransactionHttpAdapter"
import { AddControlListMemberTransactionAppService } from "@app/transaction/controlllist/addcontrollistmembertransaction/service/AddControlListMemberTransactionAppService"
import { AddControlListMemberCommandHandler } from "@app/controllist/addcontrollistmember/command/AddControlListMemberCommandHandler"
import { AddControlListMemberNestJSEventAdapter } from "@port/controllist/usecase/addcontrollistmember/AddControlListMemberNestJSEventAdapter"
import { AddBondControlListMemberDomainService } from "@domain/controllist/service/AddBondControlListMemberDomainService"
import { RemoveControlListMemberTransactionHttpAdapter } from "@port/transaction/usecase/removecontrollistmembertransaction/RemoveControlListMemberTransactionHttpAdapter"
import { RemoveControlListMemberTransactionAppService } from "@app/transaction/controlllist/removecontrollistmembertransaction/service/RemoveControlListMemberTransactionAppService"
import { RemoveControlListMemberCommandHandler } from "@app/controllist/removecontrollistmember/command/RemoveControlListMemberCommandHandler"
import { RemoveControlListMemberNestJSEventAdapter } from "@port/controllist/usecase/removecontrollistmember/RemoveControlListMemberNestJSEventAdapter"
import { RemoveBondControlListMemberDomainService } from "@domain/controllist/service/RemoveBondControlListMemberDomainService"
import { BondControlListMemberTypeOrmRepository } from "@port/controllist/persistence/repositories/BondControlListMemberTypeOrmRepository"
import { SetBondCouponTransactionHttpAdapter } from "@port/transaction/usecase/setbondcoupontransaction/SetBondCouponTransactionHttpAdapter"
import { SetBondCouponTransactionAppService } from "@app/transaction/coupon/setbondcoupontransaction/service/SetBondCouponTransactionAppService"
import { BondControlListMemberPersistence } from "@port/controllist/persistence/model/BondControlListMemberPersistence"
import { BondCouponPersistence } from "@port/coupon/persistence/model/BondCouponPersistence"
import { BondCouponTypeOrmRepository } from "@port/coupon/persistence/repositories/BondCouponTypeOrmRepository"
import { SetBondCouponCommandHandler } from "@app/coupon/setbondcoupon/command/SetBondCouponCommandHandler"
import { SetBondCouponNestJSEventAdapter } from "@port/coupon/usecase/setbondcoupon/SetBondCouponNestJSEventAdapter"
import { SetBondCouponDomainService } from "@domain/coupon/service/SetBondCouponDomainService"
import { GetBondCouponsHttpAdapter } from "@port/coupon/usecase/getbondcoupons/GetBondCouponsHttpAdapter"
import { GetBondCouponsQueryHandler } from "@app/coupon/getbondcoupons/query/GetBondCouponsQueryHandler"
import { GetBondCouponHttpAdapter } from "@port/coupon/usecase/getbondcoupon/GetBondCouponHttpAdapter"
import { GetBondCouponQueryHandler } from "@app/coupon/getbondcoupon/query/GetBondCouponQueryHandler"
import { CreateBondLockTransactionHttpAdapter } from "@port/transaction/usecase/createbondlocktransaction/CreateBondLockTransactionHttpAdapter"
import { CreateBondLockTransactionAppService } from "@app/transaction/lock/createbondlocktransaction/service/CreateBondLockTransactionAppService"
import { CreateBondLockCommandHandler } from "@app/lock/createbondlock/command/CreateBondLockCommandHandler"
import { CreateBondLockNestJSEventAdapter } from "@port/lock/usecase/createbondlock/CreateBondLockNestJSEventAdapter"
import { CreateBondLockDomainService } from "@domain/lock/service/CreateBondLockDomainService"
import { BondLockPersistence } from "@port/lock/persistence/model/BondLockPersistence"
import { BondLockTypeOrmRepository } from "@port/lock/persistence/repositories/BondLockTypeOrmRepository"
import { MintBondTransactionHttpAdapter } from "@port/transaction/usecase/mintbondtransaction/MintBondTransactionHttpAdapter"
import { MintBondTransactionAppService } from "@app/transaction/bond/mintbondtransaction/service/MintBondTransactionAppService"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { BondHolderBalanceTypeOrmRepository } from "@port/holderbalance/persistence/repositories/BondHolderBalanceTypeOrmRepository"
import { UpdateBondHolderBalanceNestJSEventAdapter } from "@port/holderbalance/usecase/updatebondholderbalance/UpdateBondHolderBalanceNestJSEventAdapter"
import { UpdateBondHolderBalanceDomainService } from "@domain/holderbalance/service/UpdateBondHolderBalanceDomainService"
import { UpdateBondHolderBalanceCommandHandler } from "@app/holderbalance/updatebondholderbalance/command/UpdateBondHolderBalanceCommandHandler"
import { DecreaseBondHolderAvailableBalanceDomainService } from "@domain/holderbalance/service/DecreaseBondHolderAvailableBalanceDomainService"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"
import { ExecuteHoldBondHolderBalanceDomainService } from "@domain/holderbalance/service/ExecuteHoldBondHolderBalanceDomainService"
import { ReleaseHoldBondHolderBalanceDomainService } from "@domain/holderbalance/service/ReleaseHoldBondHolderBalanceDomainService"
import {
  COMMON_FUNCTIONALITY_ENTITIES,
  COMMON_FUNCTIONALITY_PROVIDERS,
  TypeOrmTransactionManager,
} from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockTransactionHttpAdapter } from "@port/transaction/usecase/releasebondlocktransaction/ReleaseBondLockTransactionHttpAdapter"
import { ReleaseBondLockTransactionAppService } from "@app/transaction/lock/releasebondlocktransaction/service/ReleaseBondLockTransactionAppService"
import { ReleaseBondLockCommandHandler } from "@app/lock/releasebondlock/command/ReleaseBondLockCommandHandler"
import { ReleaseBondLockNestJSEventAdapter } from "@port/lock/usecase/releasebondlock/ReleaseBondLockNestJSEventAdapter"
import { CancelClearingCommandHandler } from "@app/clearing/cancelclearing/command/CancelClearingCommandHandler"
import { ReclaimClearingCommandHandler } from "@app/clearing/reclaimclearing/command/ReclaimClearingCommandHandler"
import { ApproveClearingCommandHandler } from "@app/clearing/approveclearing/command/ApproveClearingCommandHandler"
import { DeleteBondLockDomainService } from "@domain/lock/service/DeleteBondLockDomainService"
import { UnlockBondHolderBalanceDomainService } from "@domain/holderbalance/service/UnlockBondHolderBalanceDomainService"
import { GetBondLocksHttpAdapter } from "@port/lock/usecase/getbondlocks/GetBondLocksHttpAdapter"
import { GetBondLocksQueryHandler } from "@app/lock/getbondlocks/query/GetBondLocksQueryHandler"
import { GetBondLockHttpAdapter } from "@port/lock/usecase/getbondlock/GetBondLockHttpAdapter"
import { GetBondLockQueryHandler } from "@app/lock/getbondlock/query/GetBondLockQueryHandler"
import { GetBondHoldersHttpAdapter } from "@port/holderbalance/usecase/getbondholders/GetBondHoldersHttpAdapter"
import { GetBondHoldersQueryHandler } from "@app/holderbalance/getbondholders/query/GetBondHoldersQueryHandler"
import { GetHolderBalancesHttpAdapter } from "@port/holderbalance/usecase/getholderbalances/GetHolderBalancesHttpAdapter"
import { GetHolderBalancesQueryHandler } from "@app/holderbalance/getholderbalances/query/GetHolderBalancesQueryHandler"
import { GetBondHoldsHttpAdapter } from "@port/hold/usecase/getbondholds/GetBondHoldsHttpAdapter"
import { GetBondHoldsQueryHandler } from "@app/hold/getbondholds/query/GetBondHoldsQueryHandler"
import { GetBondHoldHttpAdapter } from "@port/hold/usecase/getbondhold/GetBondHoldHttpAdapter"
import { GetBondHoldQueryHandler } from "@app/hold/getbondhold/query/GetBondHoldQueryHandler"
import { PauseBondTransactionHttpAdapter } from "@port/transaction/usecase/pausebondtransaction/PauseBondTransactionHttpAdapter"
import { UnpauseBondTransactionHttpAdapter } from "@port/transaction/usecase/unpausebond/UnpauseBondTransactionHttpAdapter"
import { GetFactoryHttpAdapter } from "@port/factory/usecase/getfactory/GetFactoryHttpAdapter"
import { GetFactoryQueryHandler } from "@app/factory/getfactory/query/GetFactoryQueryHandler"
import { FactoryPersistence } from "@port/factory/persistence/model/FactoryPersistence"
import { FactoryTypeOrmRepository } from "@port/factory/persistence/repositories/FactoryTypeOrmRepository"
import { DatabaseSeederService } from "@config/DatabaseSeederService"
import { CheckFactoryExistsDomainService } from "@domain/factory/service/CheckFactoryExistsDomainService"
import { PauseFactoryDomainService } from "@domain/factory/service/PauseFactoryDomainService"
import { UnpauseFactoryDomainService } from "@domain/factory/service/UnpauseFactoryDomainService"
import { PauseFactoryTransactionHttpAdapter } from "@port/transaction/usecase/pausefactorytransaction/PauseFactoryTransactionHttpAdapter"
import { UnpauseFactoryTransactionHttpAdapter } from "@port/transaction/usecase/unpausefactorytransaction/UnpauseFactoryTransactionHttpAdapter"
import { PauseFactoryCommandHandler } from "@app/factory/pausefactory/command/PauseFactoryCommandHandler"
import { UnpauseFactoryCommandHandler } from "@app/factory/unpausefactory/command/UnpauseFactoryCommandHandler"
import { PauseFactoryNestJSEventAdapter } from "@port/factory/usecase/pausefactory/PauseFactoryNestJSEventAdapter"
import { UnpauseFactoryNestJSEventAdapter } from "@port/factory/usecase/unpausefactory/UnpauseFactoryNestJSEventAdapter"
import { AddProceedRecipientTransactionHttpAdapter } from "@port/transaction/usecase/addproceedrecipienttransaction/AddProceedRecipientTransactionHttpAdapter"
import { AddProceedRecipientTransactionAppService } from "@app/transaction/proceedrecipient/addproceedrecipienttransaction/service/AddProceedRecipientTransactionAppService"
import { AddProceedRecipientNestJSEventAdapter } from "@port/proceedrecipient/usecase/addproceedrecipient/AddProceedRecipientNestJSEventAdapter"
import { AddProceedRecipientCommandHandler } from "@app/proceedrecipient/addproceedrecipient/command/AddProceedRecipientCommandHandler"
import { AddBondProceedRecipientDomainService } from "@domain/proceedrecipient/service/AddBondProceedRecipientDomainService"
import { BondProceedRecipientTypeOrmRepository } from "@port/proceedrecipient/persistence/repositories/BondProceedRecipientTypeOrmRepository"
import { BondProceedRecipientPersistence } from "@port/proceedrecipient/persistence/model/BondProceedRecipientPersistence"
import { GetBondProceedRecipientsHttpAdapter } from "@port/proceedrecipient/usecase/getbondproceedrecipients/GetBondProceedRecipientsHttpAdapter"
import { GetBondProceedRecipientsQueryHandler } from "@app/proceedrecipient/getbondproceedrecipients/query/GetBondProceedRecipientsQueryHandler"
import { RemoveProceedRecipientTransactionHttpAdapter } from "@port/transaction/usecase/removeproceedrecipienttransaction/RemoveProceedRecipientTransactionHttpAdapter"
import { RemoveProceedRecipientTransactionAppService } from "@app/proceedrecipient/removeproceedrecipient/transaction/RemoveProceedRecipientTransactionAppService"
import { RemoveProceedRecipientNestJSEventAdapter } from "@port/proceedrecipient/usecase/removeproceedrecipient/RemoveProceedRecipientNestJSEventAdapter"
import { RemoveProceedRecipientCommandHandler } from "@app/proceedrecipient/removeproceedrecipient/command/RemoveProceedRecipientCommandHandler"
import { RemoveBondProceedRecipientDomainService } from "@domain/proceedrecipient/service/RemoveBondProceedRecipientDomainService"
import { PauseBondCommandHandler } from "@app/bond/pausebond/command/PauseBondCommandHandler"
import { UnpauseBondCommandHandler } from "@app/bond/unpausebond/command/UnpauseBondCommandHandler"
import { PauseBondNestJSEventAdapter } from "@port/bond/usecase/pausebond/PauseBondNestJSEventAdapter"
import { UnpauseBondNestJSEventAdapter } from "@port/bond/usecase/unpausebond/UnpauseBondNestJSEventAdapter"
import { GetControlListMembersHttpAdapter } from "@port/controllist/usecase/getcontrollistmembers/GetControlListMembersHttpAdapter"
import { GetControlListMembersQueryHandler } from "@app/controllist/getcontrollistmembers/query/GetControlListMembersQueryHandler"
import { GetBondDocumentsHttpAdapter } from "@port/document/usecase/getbonddocuments/GetBondDocumentsHttpAdapter"
import { GetBondDocumentsQueryHandler } from "@app/document/getbonddocuments/query/GetBondDocumentsQueryHandler"
import { RedeemBondTransactionHttpAdapter } from "@port/transaction/usecase/redeembondtransaction/RedeemBondTransactionHttpAdapter"
import { RedeemBondTransactionAppService } from "@app/transaction/bond/redeembondtransaction/service/RedeemBondTransactionAppService"
import { RedeemBondHolderBalanceCommandHandler } from "@app/holderbalance/redeembondholderbalance/command/RedeemBondHolderBalanceCommandHandler"
import { RedeemBondHolderBalanceNestJSEventAdapter } from "@port/holderbalance/usecase/redeembondholderbalance/RedeemBondHolderBalanceNestJSEventAdapter"
import { RedeemBondHolderBalanceDomainService } from "@domain/holderbalance/service/RedeemBondHolderBalanceDomainService"
import { TransferByPartitionTransactionHttpAdapter } from "@port/transaction/usecase/transferbypartitiontransaction/TransferByPartitionTransactionHttpAdapter"
import { TransferByPartitionTransactionAppService } from "@app/transaction/holderbalance/transferbypartitiontransaction/service/TransferByPartitionTransactionAppService"
import { TransferByPartitionNestJSEventAdapter } from "@port/holderbalance/usecase/transferbypartition/TransferByPartitionNestJSEventAdapter"
import { TransferByPartitionCommandHandler } from "@app/holderbalance/transferbypartition/command/TransferByPartitionCommandHandler"
import { TransferBondHolderBalanceDomainService } from "@domain/holderbalance/service/TransferBondHolderBalanceDomainService"
import { CreateBondHoldTransactionHttpAdapter } from "@port/transaction/usecase/createbondholdtransaction/CreateBondHoldTransactionHttpAdapter"
import { CreateBondHoldTransactionAppService } from "@app/transaction/hold/createbondholdtransaction/service/CreateBondHoldTransactionAppService"
import { CreateBondHoldCommandHandler } from "@app/hold/createbondhold/command/CreateBondHoldCommandHandler"
import { CreateBondHoldNestJSEventAdapter } from "@port/hold/usecase/createbondhold/CreateBondHoldNestJSEventAdapter"
import { CreateBondHoldDomainService } from "@domain/hold/service/CreateBondHoldDomainService"
import { DeleteBondHoldDomainService } from "@domain/hold/service/DeleteBondHoldDomainService"
import { BondHoldPersistence } from "@port/hold/persistence/model/BondHoldPersistence"
import { BondHoldTypeOrmRepository } from "@port/hold/persistence/repositories/BondHoldTypeOrmRepository"
import { ClearingHoldTypeOrmRepository } from "@port/clearing/persistence/repositories/ClearingHoldTypeOrmRepository"
import { CreateClearingHoldTransactionHttpAdapter } from "@port/transaction/usecase/createclearingholdtransaction/CreateClearingHoldTransactionHttpAdapter"
import { CreateClearingHoldTransactionAppService } from "@app/transaction/clearing/createclearingholdtransaction/service/CreateClearingHoldTransactionAppService"
import { CreateClearingRedeemTransactionHttpAdapter } from "@port/transaction/usecase/createclearingredeemtransaction/CreateClearingRedeemTransactionHttpAdapter"
import { CreateClearingRedeemTransactionAppService } from "@app/transaction/clearing/createclearingredeemtransaction/service/CreateClearingRedeemTransactionAppService"
import { CreateClearingTransferTransactionHttpAdapter } from "@port/transaction/usecase/createclearingtransfertransaction/CreateClearingTransferTransactionHttpAdapter"
import { CreateClearingTransferTransactionAppService } from "@app/transaction/clearing/createclearingtransfertransaction/service/CreateClearingTransferTransactionAppService"
import { UpdateClearingStatusTransactionHttpAdapter } from "@port/transaction/usecase/updateclearingstatustransaction/UpdateClearingStatusTransactionHttpAdapter"
import { UpdateClearingHoldTransactionAppService } from "@app/transaction/clearing/updateclearingholdtransaction/service/UpdateClearingHoldTransactionAppService"
import { ExecuteHoldHttpAdapter } from "@port/transaction/usecase/executeholdtransaction/ExecuteHoldHttpAdapter"
import { ExecuteHoldAppService } from "@app/transaction/hold/executeholdtransaction/service/ExecuteHoldAppService"
import { ReleaseHoldHttpAdapter } from "@port/transaction/usecase/releaseholdtransaction/ReleaseHoldHttpAdapter"
import { ReleaseHoldAppService } from "@app/transaction/hold/releaseholdtransaction/service/ReleaseHoldAppService"
import { ReclaimHoldHttpAdapter } from "@port/transaction/usecase/reclaimholdtransaction/ReclaimHoldHttpAdapter"
import { ReclaimHoldAppService } from "@app/transaction/hold/reclaimholdtransaction/service/ReclaimHoldAppService"
import { ExecuteBondHoldCommandHandler } from "@app/hold/executebondhold/command/ExecuteBondHoldCommandHandler"
import { ReleaseBondHoldCommandHandler } from "@app/hold/releasebondhold/command/ReleaseBondHoldCommandHandler"
import { ReclaimBondHoldCommandHandler } from "@app/hold/reclaimbondhold/command/ReclaimBondHoldCommandHandler"
import { ExecutedHoldByPartitionNestJSEventAdapter } from "@port/hold/usecase/executedholdbypartition/ExecutedHoldByPartitionNestJSEventAdapter"
import { ReleasedHoldByPartitionNestJSEventAdapter } from "@port/hold/usecase/releasedholdbypartition/ReleasedHoldByPartitionNestJSEventAdapter"
import { ReclaimedHoldByPartitionNestJSEventAdapter } from "@port/hold/usecase/reclaimedholdbypartition/ReclaimedHoldByPartitionNestJSEventAdapter"
import { CancelClearingTransactionHttpAdapter } from "@port/transaction/usecase/cancelclearingtransaction/CancelClearingTransactionHttpAdapter"
import { CancelClearingTransactionAppService } from "@app/transaction/clearing/cancelclearingtransaction/service/CancelClearingTransactionAppService"
import { GetClearingsHoldHttpAdapter } from "@port/clearing/usecase/getclearingshold/GetClearingsHoldHttpAdapter"
import { GetClearingHoldHttpAdapter } from "@port/clearing/usecase/getclearinghold/GetClearingHoldHttpAdapter"
import { GetClearingsTransferHttpAdapter } from "@port/clearing/usecase/getclearingstransfer/GetClearingsTransferHttpAdapter"
import { GetClearingTransferHttpAdapter } from "@port/clearing/usecase/getclearingtransfer/GetClearingTransferHttpAdapter"
import { GetClearingsRedeemHttpAdapter } from "@port/clearing/usecase/getclearingsredeem/GetClearingsRedeemHttpAdapter"
import { GetClearingRedeemHttpAdapter } from "@port/clearing/usecase/getclearingredeem/GetClearingRedeemHttpAdapter"
import { CreateClearingHoldDomainService } from "@domain/clearing/service/CreateClearingHoldDomainService"
import { UpdateClearingHoldStatusDomainService } from "@domain/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/clearing/service/UpdateClearingRedeemStatusDomainService"
import { DeleteClearingHoldDomainService } from "@domain/clearing/service/DeleteClearingHoldDomainService"
import { DeleteClearingRedeemDomainService } from "@domain/clearing/service/DeleteClearingRedeemDomainService"
import { GetClearingsHoldDomainService } from "@domain/clearing/service/GetClearingsHoldDomainService"
import { GetClearingHoldByIdDomainService } from "@domain/clearing/service/GetClearingHoldByIdDomainService"
import { GetClearingsTransferDomainService } from "@domain/clearing/service/GetClearingsTransferDomainService"
import { GetClearingTransferByIdDomainService } from "@domain/clearing/service/GetClearingTransferByIdDomainService"
import { GetClearingsRedeemDomainService } from "@domain/clearing/service/GetClearingsRedeemDomainService"
import { GetClearingRedeemByIdDomainService } from "@domain/clearing/service/GetClearingRedeemByIdDomainService"
import { GetClearingsHoldQueryHandler } from "@app/clearing/getclearingshold/query/GetClearingsHoldQueryHandler"
import { GetClearingHoldQueryHandler } from "@app/clearing/getclearinghold/query/GetClearingHoldQueryHandler"
import { GetClearingsTransferQueryHandler } from "@app/clearing/getclearingstransfer/query/GetClearingsTransferQueryHandler"
import { GetClearingTransferQueryHandler } from "@app/clearing/getclearingtransfer/query/GetClearingTransferQueryHandler"
import { GetClearingsRedeemQueryHandler } from "@app/clearing/getclearingsredeem/query/GetClearingsRedeemQueryHandler"
import { GetClearingRedeemQueryHandler } from "@app/clearing/getclearingredeem/query/GetClearingRedeemQueryHandler"
import { ClearedHoldNestJSEventAdapter } from "@port/clearing/usecase/clearedhold/ClearedHoldNestJSEventAdapter"
import {
  ClearingOperationApprovedNestJSEventAdapter,
  ClearingOperationReclaimedNestJSEventAdapter,
} from "@port/clearing/usecase/updateclearingoperation/UpdateClearingOperationNestJSEventAdapter"
import { CancelClearingOperationNestJSEventAdapter } from "@port/clearing/usecase/cancelclearingoperation/CancelClearingOperationNestJSEventAdapter"
import { BondClearingHoldPersistence } from "@port/clearing/persistence/model/BondClearingHoldPersistence"
import { BondClearingRedeemPersistence } from "@port/clearing/persistence/model/BondClearingRedeemPersistence"
import { BondClearingTransferPersistence } from "@port/clearing/persistence/model/BondClearingTransferPersistence"
import { CreateClearingHoldCommandHandler } from "@app/clearing/createclearinghold/command/CreateClearingHoldCommandHandler"
import { CreateClearingRedeemCommandHandler } from "@app/clearing/createclearingredeem/command/CreateClearingRedeemCommandHandler"
import { CreateClearingTransferCommandHandler } from "@app/clearing/createclearingtransfer/command/CreateClearingTransferCommandHandler"
import { ClearedRedeemNestJSEventAdapter } from "@port/clearing/usecase/clearedredeem/ClearedRedeemNestJSEventAdapter"
import { ClearedTransferNestJSEventAdapter } from "@port/clearing/usecase/clearedtransfer/ClearedTransferNestJSEventAdapter"
import { ClearingRedeemTypeOrmRepository } from "@port/clearing/persistence/repositories/ClearingRedeemTypeOrmRepository"
import { ClearingTransferTypeOrmRepository } from "@port/clearing/persistence/repositories/ClearingTransferTypeOrmRepository"
import { CreateClearingRedeemDomainService } from "@domain/clearing/service/CreateClearingRedeemDomainService"
import { GetRoleMembersHttpAdapter } from "@port/bond/usecase/getrolemembers/GetRoleMembersHttpAdapter"
import { GetUserRolesHttpAdapter } from "@port/bond/usecase/getuserroles/GetUserRolesHttpAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrolebondtransaction/GrantRoleTransactionHttpAdapter"
import { RevokeRoleTransactionHttpAdapter } from "@port/transaction/usecase/revokerolebondtransaction/RevokeRoleTransactionHttpAdapter"
import { GrantRoleNestJSEventAdapter } from "@port/bond/usecase/grantrole/GrantRoleNestJSEventAdapter"
import { RevokeRoleNestJSEventAdapter } from "@port/bond/usecase/revokerole/RevokeRoleNestJSEventAdapter"
import { GetRoleMembersHttpAdapter as GetFactoryRoleMembersHttpAdapter } from "@port/factory/usecase/getrolemembers/GetRoleMembersHttpAdapter"
import { GetUserRolesHttpAdapter as GetFactoryUserRolesHttpAdapter } from "@port/factory/usecase/getuserroles/GetUserRolesHttpAdapter"
import { GrantRoleTransactionHttpAdapter as GrantFactoryRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrolefactorytransaction/GrantRoleTransactionHttpAdapter"
import { RevokeRoleTransactionHttpAdapter as RevokeFactoryRoleTransactionHttpAdapter } from "@port/transaction/usecase/revokerolefactorytransaction/RevokeRoleTransactionHttpAdapter"
import { CreateClearingTransferDomainService } from "@domain/clearing/service/CreateClearingTransferDomainService"
import { UpdateClearingTransferStatusDomainService } from "@domain/clearing/service/UpdateClearingTransferStatusDomainService"
import { DeleteClearingTransferDomainService } from "@domain/clearing/service/DeleteClearingTransferDomainService"
import { ApproveHoldClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveHoldClearingBalanceDomainService"
import { ApproveRedeemClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveRedeemClearingBalanceDomainService"
import { ApproveTransferClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveTransferClearingBalanceDomainService"
import { SetBondInterestRateNestJSEventAdapter } from "@port/interestrate/usecase/setbondinterestrate/SetBondInterestRateNestJSEventAdapter"
import { SetBondInterestRateCommandHandler } from "@app/interestrate/setbondinterestrate/command/SetBondInterestRateCommandHandler"
import { SetBondInterestRateDomainService } from "@domain/interestrate/service/SetBondInterestRateDomainService"
import { BondInterestRatePersistence } from "@port/interestrate/persistence/model/BondInterestRatePersistence"
import { BondInterestRateTypeOrmRepository } from "@port/interestrate/persistence/repositories/BondInterestRateTypeOrmRepository"
import { SetBondImpactDataNestJSEventAdapter } from "@port/impactdata/usecase/setbondimpactdata/SetBondImpactDataNestJSEventAdapter"
import { SetBondImpactDataCommandHandler } from "@app/impactdata/setbondimpactdata/command/SetBondImpactDataCommandHandler"
import { SetBondImpactDataDomainService } from "@domain/impactdata/service/SetBondImpactDataDomainService"
import { BondImpactDataPersistence } from "@port/impactdata/persistence/model/BondImpactDataPersistence"
import { BondImpactDataTypeOrmRepository } from "@port/impactdata/persistence/repositories/BondImpactDataTypeOrmRepository"
import { AddBondKpiDataNestJSEventAdapter } from "@port/kpidata/usecase/addbondkpidata/AddBondKpiDataNestJSEventAdapter"
import { AddBondKpiDataCommandHandler } from "@app/kpidata/addbondkpidata/command/AddBondKpiDataCommandHandler"
import { AddBondKpiDataDomainService } from "@domain/kpidata/service/AddBondKpiDataDomainService"
import { BondKpiDataPersistence } from "@port/kpidata/persistence/model/BondKpiDataPersistence"
import { BondKpiDataTypeOrmRepository } from "@port/kpidata/persistence/repositories/BondKpiDataTypeOrmRepository"

const REPOSITORIES: Provider[] = [
  {
    provide: "BondRepository",
    useClass: BondTypeOrmRepository,
  },
  {
    provide: "BondDocumentRepository",
    useClass: BondDocumentTypeOrmRepository,
  },
  {
    provide: "BondControlListMemberRepository",
    useClass: BondControlListMemberTypeOrmRepository,
  },
  {
    provide: "BondCouponRepository",
    useClass: BondCouponTypeOrmRepository,
  },
  {
    provide: "BondLockRepository",
    useClass: BondLockTypeOrmRepository,
  },
  {
    provide: "BondHolderBalanceRepository",
    useClass: BondHolderBalanceTypeOrmRepository,
  },
  {
    provide: "BondProceedRecipientRepository",
    useClass: BondProceedRecipientTypeOrmRepository,
  },
  {
    provide: "BondHoldRepository",
    useClass: BondHoldTypeOrmRepository,
  },
  {
    provide: "ClearingHoldRepository",
    useClass: ClearingHoldTypeOrmRepository,
  },
  {
    provide: "ClearingRedeemRepository",
    useClass: ClearingRedeemTypeOrmRepository,
  },
  {
    provide: "ClearingTransferRepository",
    useClass: ClearingTransferTypeOrmRepository,
  },
  {
    provide: "FactoryRepository",
    useClass: FactoryTypeOrmRepository,
  },
  {
    provide: "BondInterestRateRepository",
    useClass: BondInterestRateTypeOrmRepository,
  },
  {
    provide: "BondImpactDataRepository",
    useClass: BondImpactDataTypeOrmRepository,
  },
  {
    provide: "BondKpiDataRepository",
    useClass: BondKpiDataTypeOrmRepository,
  },
]

export const CONTROLLERS = [
  CreateBondTransactionHttpAdapter,
  GetBondHttpAdapter,
  GetBondsHttpAdapter,
  SetBondDocumentTransactionHttpAdapter,
  RemoveBondDocumentTransactionHttpAdapter,
  SetBondCapTransactionHttpAdapter,
  AddControlListMemberTransactionHttpAdapter,
  RemoveControlListMemberTransactionHttpAdapter,
  SetBondCouponTransactionHttpAdapter,
  GetBondCouponsHttpAdapter,
  GetBondCouponHttpAdapter,
  GetBondDocumentsHttpAdapter,
  GetBondLocksHttpAdapter,
  GetBondLockHttpAdapter,
  GetBondHoldersHttpAdapter,
  GetHolderBalancesHttpAdapter,
  GetBondHoldsHttpAdapter,
  GetBondHoldHttpAdapter,
  GetControlListMembersHttpAdapter,
  CreateBondLockTransactionHttpAdapter,
  MintBondTransactionHttpAdapter,
  ReleaseBondLockTransactionHttpAdapter,
  RedeemBondTransactionHttpAdapter,
  PauseBondTransactionHttpAdapter,
  UnpauseBondTransactionHttpAdapter,
  AddProceedRecipientTransactionHttpAdapter,
  RemoveProceedRecipientTransactionHttpAdapter,
  GetBondProceedRecipientsHttpAdapter,
  GetFactoryHttpAdapter,
  PauseFactoryTransactionHttpAdapter,
  UnpauseFactoryTransactionHttpAdapter,
  TransferByPartitionTransactionHttpAdapter,
  CreateBondHoldTransactionHttpAdapter,
  ExecuteHoldHttpAdapter,
  ReleaseHoldHttpAdapter,
  ReclaimHoldHttpAdapter,
  CreateClearingHoldTransactionHttpAdapter,
  CreateClearingRedeemTransactionHttpAdapter,
  CreateClearingTransferTransactionHttpAdapter,
  UpdateClearingStatusTransactionHttpAdapter,
  CancelClearingTransactionHttpAdapter,
  GetClearingsHoldHttpAdapter,
  GetClearingHoldHttpAdapter,
  GetRoleMembersHttpAdapter,
  GetUserRolesHttpAdapter,
  GrantRoleTransactionHttpAdapter,
  RevokeRoleTransactionHttpAdapter,
  GetFactoryRoleMembersHttpAdapter,
  GetFactoryUserRolesHttpAdapter,
  GrantFactoryRoleTransactionHttpAdapter,
  RevokeFactoryRoleTransactionHttpAdapter,
  GetClearingsTransferHttpAdapter,
  GetClearingTransferHttpAdapter,
  GetClearingsRedeemHttpAdapter,
  GetClearingRedeemHttpAdapter,
]
export const PROVIDERS = [
  ...REPOSITORIES,
  ...COMMON_FUNCTIONALITY_PROVIDERS,
  DatabaseSeederService,
  CreateBondTransactionAppService,
  CreateBondNestJSEventAdapter,
  CreateBondDomainService,
  CreateBondCommandHandler,
  GetBondQueryHandler,
  CheckBondExistsDomainService,
  GetBondsQueryHandler,
  GetBondCouponsQueryHandler,
  GetBondCouponQueryHandler,
  GetBondDocumentsQueryHandler,
  GetBondLocksQueryHandler,
  GetBondLockQueryHandler,
  GetBondHoldersQueryHandler,
  GetHolderBalancesQueryHandler,
  GetBondHoldsQueryHandler,
  GetBondHoldQueryHandler,
  GetControlListMembersQueryHandler,
  SetBondDocumentTransactionAppService,
  SetBondDocumentCommandHandler,
  SetBondDocumentNestJSEventAdapter,
  SetBondDocumentDomainService,
  RemoveBondDocumentTransactionAppService,
  RemoveBondDocumentCommandHandler,
  RemoveBondDocumentNestJSEventAdapter,
  RemoveBondDocumentDomainService,
  SetBondCapTransactionAppService,
  SetBondCapCommandHandler,
  SetBondCapNestJSEventAdapter,
  SetBondCapDomainService,
  AddControlListMemberTransactionAppService,
  AddControlListMemberCommandHandler,
  AddControlListMemberNestJSEventAdapter,
  AddBondControlListMemberDomainService,
  SetBondCouponTransactionAppService,
  SetBondCouponCommandHandler,
  SetBondCouponNestJSEventAdapter,
  SetBondCouponDomainService,
  RemoveControlListMemberTransactionAppService,
  RemoveControlListMemberCommandHandler,
  RemoveControlListMemberNestJSEventAdapter,
  RemoveBondControlListMemberDomainService,
  CreateBondLockTransactionAppService,
  CreateBondLockCommandHandler,
  CreateBondLockNestJSEventAdapter,
  CreateBondLockDomainService,
  MintBondTransactionAppService,
  UpdateBondHolderBalanceNestJSEventAdapter,
  UpdateBondHolderBalanceDomainService,
  UpdateBondHolderBalanceCommandHandler,
  DecreaseBondHolderAvailableBalanceDomainService,
  ReleaseBondLockTransactionAppService,
  ReleaseBondLockCommandHandler,
  ReleaseBondLockNestJSEventAdapter,
  DeleteBondLockDomainService,
  UnlockBondHolderBalanceDomainService,
  ExecuteHoldBondHolderBalanceDomainService,
  ReleaseHoldBondHolderBalanceDomainService,
  RedeemBondTransactionAppService,
  RedeemBondHolderBalanceCommandHandler,
  RedeemBondHolderBalanceNestJSEventAdapter,
  RedeemBondHolderBalanceDomainService,
  UpdateClearingBondHolderBalanceDomainService,
  ApproveHoldClearingBalanceDomainService,
  ApproveRedeemClearingBalanceDomainService,
  ApproveTransferClearingBalanceDomainService,
  CancelClearingCommandHandler,
  ReclaimClearingCommandHandler,
  ApproveClearingCommandHandler,
  PauseBondCommandHandler,
  UnpauseBondCommandHandler,
  PauseBondNestJSEventAdapter,
  UnpauseBondNestJSEventAdapter,
  TransferByPartitionTransactionAppService,
  TransferByPartitionCommandHandler,
  TransferByPartitionNestJSEventAdapter,
  TransferBondHolderBalanceDomainService,
  CreateBondHoldTransactionAppService,
  CreateBondHoldCommandHandler,
  CreateBondHoldNestJSEventAdapter,
  CreateBondHoldDomainService,
  DeleteBondHoldDomainService,
  ExecuteHoldAppService,
  ReleaseHoldAppService,
  ReclaimHoldAppService,
  ExecuteBondHoldCommandHandler,
  ReleaseBondHoldCommandHandler,
  ReclaimBondHoldCommandHandler,
  ExecutedHoldByPartitionNestJSEventAdapter,
  ReleasedHoldByPartitionNestJSEventAdapter,
  ReclaimedHoldByPartitionNestJSEventAdapter,
  CreateBondFiltersAdapter,
  CreateClearingHoldTransactionAppService,
  CreateClearingRedeemTransactionAppService,
  AddProceedRecipientTransactionAppService,
  AddProceedRecipientCommandHandler,
  AddProceedRecipientNestJSEventAdapter,
  AddBondProceedRecipientDomainService,
  RemoveProceedRecipientTransactionAppService,
  RemoveProceedRecipientCommandHandler,
  RemoveProceedRecipientNestJSEventAdapter,
  RemoveBondProceedRecipientDomainService,
  GetBondProceedRecipientsQueryHandler,
  GrantRoleNestJSEventAdapter,
  RevokeRoleNestJSEventAdapter,
  CreateClearingHoldTransactionAppService,
  CreateClearingRedeemTransactionAppService,
  CreateClearingTransferTransactionAppService,
  UpdateClearingHoldTransactionAppService,
  CancelClearingTransactionAppService,
  CreateClearingHoldDomainService,
  CreateClearingRedeemDomainService,
  CreateClearingTransferDomainService,
  CreateClearingHoldCommandHandler,
  CreateClearingRedeemCommandHandler,
  CreateClearingTransferCommandHandler,
  ClearedRedeemNestJSEventAdapter,
  ClearedTransferNestJSEventAdapter,
  UpdateClearingHoldStatusDomainService,
  UpdateClearingRedeemStatusDomainService,
  UpdateClearingTransferStatusDomainService,
  DeleteClearingHoldDomainService,
  DeleteClearingRedeemDomainService,
  DeleteClearingTransferDomainService,
  GetClearingsHoldDomainService,
  GetClearingHoldByIdDomainService,
  GetClearingsHoldQueryHandler,
  GetClearingHoldQueryHandler,
  GetClearingsTransferDomainService,
  GetClearingTransferByIdDomainService,
  GetClearingsTransferQueryHandler,
  GetClearingTransferQueryHandler,
  GetClearingsRedeemDomainService,
  GetClearingRedeemByIdDomainService,
  GetClearingsRedeemQueryHandler,
  GetClearingRedeemQueryHandler,
  ClearedHoldNestJSEventAdapter,
  ClearingOperationApprovedNestJSEventAdapter,
  CancelClearingOperationNestJSEventAdapter,
  ClearingOperationReclaimedNestJSEventAdapter,
  GetFactoryQueryHandler,
  CheckFactoryExistsDomainService,
  PauseFactoryDomainService,
  UnpauseFactoryDomainService,
  PauseFactoryCommandHandler,
  UnpauseFactoryCommandHandler,
  PauseFactoryNestJSEventAdapter,
  UnpauseFactoryNestJSEventAdapter,
  SetBondInterestRateNestJSEventAdapter,
  SetBondInterestRateCommandHandler,
  SetBondInterestRateDomainService,
  SetBondImpactDataNestJSEventAdapter,
  SetBondImpactDataCommandHandler,
  SetBondImpactDataDomainService,
  AddBondKpiDataNestJSEventAdapter,
  AddBondKpiDataCommandHandler,
  AddBondKpiDataDomainService,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
  {
    provide: "TransactionManager",
    useClass: TypeOrmTransactionManager,
  },
]
export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  ...COMMON_FUNCTIONALITY_ENTITIES,
  BondPersistence,
  BondDocumentPersistence,
  BondControlListMemberPersistence,
  BondCouponPersistence,
  BondLockPersistence,
  BondHolderBalancePersistence,
  BondProceedRecipientPersistence,
  BondHoldPersistence,
  BondClearingHoldPersistence,
  BondClearingRedeemPersistence,
  BondClearingTransferPersistence,
  FactoryPersistence,
  BondInterestRatePersistence,
  BondImpactDataPersistence,
  BondKpiDataPersistence,
]
