import { CreateBondTransactionHttpAdapter } from "@port/transaction/usecase/createbondtransaction/CreateBondTransactionHttpAdapter"
import { CreateBondTransactionAppService } from "@app/bond/transaction/createbondtransaction/service/CreateBondTransactionAppService"
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
import { SetBondDocumentTransactionAppService } from "@app/bond/transaction/setbonddocumenttransaction/service/SetBondDocumentTransactionAppService"
import { SetBondDocumentCommandHandler } from "@app/bond/setbonddocument/command/SetBondDocumentCommandHandler"
import { SetBondDocumentNestJSEventAdapter } from "@port/bond/usecase/setbonddocument/SetBondDocumentNestJSEventAdapter"
import { SetBondDocumentDomainService } from "@domain/bond/document/service/SetBondDocumentDomainService"
import { BondDocumentPersistence } from "@port/bond/persistence/model/BondDocumentPersistence"
import { BondDocumentTypeOrmRepository } from "@port/bond/persistence/repositories/BondDocumentTypeOrmRepository"
import { CreateBondFiltersAdapter } from "@port/bond/usecase/createbondfilters/CreateBondFiltersAdapter"
import { RemoveBondDocumentTransactionHttpAdapter } from "@port/transaction/usecase/removebonddocumenttransaction/RemoveBondDocumentTransactionHttpAdapter"
import { RemoveBondDocumentTransactionAppService } from "@app/bond/transaction/removebonddocumenttransaction/service/RemoveBondDocumentTransactionAppService"
import { RemoveBondDocumentCommandHandler } from "@app/bond/removebonddocument/command/RemoveBondDocumentCommandHandler"
import { RemoveBondDocumentNestJSEventAdapter } from "@port/bond/usecase/removebonddocument/RemoveBondDocumentNestJSEventAdapter"
import { RemoveBondDocumentDomainService } from "@domain/bond/document/service/RemoveBondDocumentDomainService"
import { SetBondCapTransactionHttpAdapter } from "@port/transaction/usecase/setbondcaptransaction/SetBondCapTransactionHttpAdapter"
import { SetBondCapTransactionAppService } from "@app/bond/transaction/setbondcaptransaction/service/SetBondCapTransactionAppService"
import { SetBondCapCommandHandler } from "@app/bond/setbondcap/command/SetBondCapCommandHandler"
import { SetBondCapNestJSEventAdapter } from "@port/bond/usecase/setbondcap/SetBondCapNestJSEventAdapter"
import { SetBondCapDomainService } from "@domain/bond/services/cap/SetBondCapDomainService"
import { AddControlListMemberTransactionHttpAdapter } from "@port/transaction/usecase/addcontrollistmembertransaction/AddControlListMemberTransactionHttpAdapter"
import { AddControlListMemberTransactionAppService } from "@app/bond/transaction/addcontrollistmembertransaction/service/AddControlListMemberTransactionAppService"
import { AddControlListMemberCommandHandler } from "@app/bond/addcontrollistmember/command/AddControlListMemberCommandHandler"
import { AddControlListMemberNestJSEventAdapter } from "@port/bond/usecase/addcontrollistmember/AddControlListMemberNestJSEventAdapter"
import { AddBondControlListMemberDomainService } from "@domain/bond/controllist/service/AddBondControlListMemberDomainService"
import { RemoveControlListMemberTransactionHttpAdapter } from "@port/transaction/usecase/removecontrollistmembertransaction/RemoveControlListMemberTransactionHttpAdapter"
import { RemoveControlListMemberTransactionAppService } from "@app/bond/transaction/removecontrollistmembertransaction/service/RemoveControlListMemberTransactionAppService"
import { RemoveControlListMemberCommandHandler } from "@app/bond/removecontrollistmember/command/RemoveControlListMemberCommandHandler"
import { RemoveControlListMemberNestJSEventAdapter } from "@port/bond/usecase/removecontrollistmember/RemoveControlListMemberNestJSEventAdapter"
import { RemoveBondControlListMemberDomainService } from "@domain/bond/controllist/service/RemoveBondControlListMemberDomainService"
import { BondControlListMemberTypeOrmRepository } from "@port/bond/persistence/repositories/BondControlListMemberTypeOrmRepository"
import { SetBondCouponTransactionHttpAdapter } from "@port/transaction/usecase/setbondcoupontransaction/SetBondCouponTransactionHttpAdapter"
import { SetBondCouponTransactionAppService } from "@app/bond/transaction/setbondcoupontransaction/service/SetBondCouponTransactionAppService"
import { BondControlListMemberPersistence } from "@port/bond/persistence/model/BondControlListMemberPersistence"
import { BondCouponPersistence } from "@port/bond/persistence/model/BondCouponPersistence"
import { BondCouponTypeOrmRepository } from "@port/bond/persistence/repositories/BondCouponTypeOrmRepository"
import { SetBondCouponCommandHandler } from "@app/bond/setbondcoupon/command/SetBondCouponCommandHandler"
import { SetBondCouponNestJSEventAdapter } from "@port/bond/usecase/setbondcoupon/SetBondCouponNestJSEventAdapter"
import { SetBondCouponDomainService } from "@domain/bond/coupon/service/SetBondCouponDomainService"
import { GetBondCouponsHttpAdapter } from "@port/bond/usecase/getbondcoupons/GetBondCouponsHttpAdapter"
import { GetBondCouponsQueryHandler } from "@app/bond/getbondcoupons/query/GetBondCouponsQueryHandler"
import { GetBondCouponHttpAdapter } from "@port/bond/usecase/getbondcoupon/GetBondCouponHttpAdapter"
import { GetBondCouponQueryHandler } from "@app/bond/getbondcoupon/query/GetBondCouponQueryHandler"
import { CreateBondLockTransactionHttpAdapter } from "@port/transaction/usecase/createbondlocktransaction/CreateBondLockTransactionHttpAdapter"
import { CreateBondLockTransactionAppService } from "@app/bond/transaction/createbondlocktransaction/service/CreateBondLockTransactionAppService"
import { CreateBondLockCommandHandler } from "@app/bond/createbondlock/command/CreateBondLockCommandHandler"
import { CreateBondLockNestJSEventAdapter } from "@port/bond/usecase/createbondlock/CreateBondLockNestJSEventAdapter"
import { CreateBondLockDomainService } from "@domain/bond/lock/service/CreateBondLockDomainService"
import { BondLockPersistence } from "@port/bond/persistence/model/BondLockPersistence"
import { BondLockTypeOrmRepository } from "@port/bond/persistence/repositories/BondLockTypeOrmRepository"
import { MintBondTransactionHttpAdapter } from "@port/transaction/usecase/mintbondtransaction/MintBondTransactionHttpAdapter"
import { MintBondTransactionAppService } from "@app/bond/transaction/mintbondtransaction/service/MintBondTransactionAppService"
import { BondHolderBalancePersistence } from "@port/bond/persistence/model/BondHolderBalancePersistence"
import { BondHolderBalanceTypeOrmRepository } from "@port/bond/persistence/repositories/BondHolderBalanceTypeOrmRepository"
import { UpdateBondHolderBalanceNestJSEventAdapter } from "@port/bond/usecase/updatebondholderbalance/UpdateBondHolderBalanceNestJSEventAdapter"
import { UpdateBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UpdateBondHolderBalanceDomainService"
import { UpdateBondHolderBalanceCommandHandler } from "@app/bond/updatebondholderbalance/command/UpdateBondHolderBalanceCommandHandler"
import { DecreaseBondHolderAvailableBalanceDomainService } from "@domain/bond/holderbalance/service/DecreaseBondHolderAvailableBalanceDomainService"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"
import { ExecuteHoldBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ExecuteHoldBondHolderBalanceDomainService"
import { ReleaseHoldBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ReleaseHoldBondHolderBalanceDomainService"
import {
  COMMON_FUNCTIONALITY_ENTITIES,
  COMMON_FUNCTIONALITY_PROVIDERS,
  TypeOrmTransactionManager,
} from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockTransactionHttpAdapter } from "@port/transaction/usecase/releasebondlocktransaction/ReleaseBondLockTransactionHttpAdapter"
import { ReleaseBondLockTransactionAppService } from "@app/bond/transaction/releasebondlocktransaction/service/ReleaseBondLockTransactionAppService"
import { ReleaseBondLockCommandHandler } from "@app/bond/releasebondlock/command/ReleaseBondLockCommandHandler"
import { ReleaseBondLockNestJSEventAdapter } from "@port/bond/usecase/releasebondlock/ReleaseBondLockNestJSEventAdapter"
import { CancelClearingCommandHandler } from "@app/bond/cancelclearing/command/CancelClearingCommandHandler"
import { ReclaimClearingCommandHandler } from "@app/bond/reclaimclearing/command/ReclaimClearingCommandHandler"
import { ApproveClearingCommandHandler } from "@app/bond/approveclearing/command/ApproveClearingCommandHandler"
import { DeleteBondLockDomainService } from "@domain/bond/lock/service/DeleteBondLockDomainService"
import { UnlockBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UnlockBondHolderBalanceDomainService"
import { GetBondLocksHttpAdapter } from "@port/bond/usecase/getbondlocks/GetBondLocksHttpAdapter"
import { GetBondLocksQueryHandler } from "@app/bond/getbondlocks/query/GetBondLocksQueryHandler"
import { GetBondLockHttpAdapter } from "@port/bond/usecase/getbondlock/GetBondLockHttpAdapter"
import { GetBondLockQueryHandler } from "@app/bond/getbondlock/query/GetBondLockQueryHandler"
import { GetBondHoldersHttpAdapter } from "@port/bond/usecase/getbondholders/GetBondHoldersHttpAdapter"
import { GetBondHoldersQueryHandler } from "@app/bond/getbondholders/query/GetBondHoldersQueryHandler"
import { GetHolderBalancesHttpAdapter } from "@port/bond/usecase/getholderbalances/GetHolderBalancesHttpAdapter"
import { GetHolderBalancesQueryHandler } from "@app/bond/getholderbalances/query/GetHolderBalancesQueryHandler"
import { GetBondHoldsHttpAdapter } from "@port/bond/usecase/getbondholds/GetBondHoldsHttpAdapter"
import { GetBondHoldsQueryHandler } from "@app/bond/getbondholds/query/GetBondHoldsQueryHandler"
import { GetBondHoldHttpAdapter } from "@port/bond/usecase/getbondhold/GetBondHoldHttpAdapter"
import { GetBondHoldQueryHandler } from "@app/bond/getbondhold/query/GetBondHoldQueryHandler"
import { PauseBondTransactionHttpAdapter } from "@port/transaction/usecase/pausebond/PauseBondTransactionHttpAdapter"
import { UnpauseBondTransactionHttpAdapter } from "@port/transaction/usecase/unpausebond/UnpauseBondTransactionHttpAdapter"
import { AddProceedRecipientTransactionHttpAdapter } from "@port/transaction/usecase/addproceedrecipienttransaction/AddProceedRecipientTransactionHttpAdapter"
import { AddProceedRecipientTransactionAppService } from "@app/bond/transaction/addproceedrecipienttransaction/service/AddProceedRecipientTransactionAppService"
import { AddProceedRecipientNestJSEventAdapter } from "@port/bond/usecase/addproceedrecipient/AddProceedRecipientNestJSEventAdapter"
import { AddProceedRecipientCommandHandler } from "@app/bond/addproceedrecipient/command/AddProceedRecipientCommandHandler"
import { AddBondProceedRecipientDomainService } from "@domain/bond/proceedrecipient/service/AddBondProceedRecipientDomainService"
import { BondProceedRecipientTypeOrmRepository } from "@port/bond/persistence/repositories/BondProceedRecipientTypeOrmRepository"
import { BondProceedRecipientPersistence } from "@port/bond/persistence/model/BondProceedRecipientPersistence"
import { GetBondProceedRecipientsHttpAdapter } from "@port/bond/usecase/getbondproceedrecipients/GetBondProceedRecipientsHttpAdapter"
import { GetBondProceedRecipientsQueryHandler } from "@app/bond/getbondproceedrecipients/query/GetBondProceedRecipientsQueryHandler"
import { RemoveProceedRecipientTransactionHttpAdapter } from "@port/transaction/usecase/removeproceedrecipienttransaction/RemoveProceedRecipientTransactionHttpAdapter"
import { RemoveProceedRecipientTransactionAppService } from "@app/bond/removeproceedrecipient/transaction/RemoveProceedRecipientTransactionAppService"
import { RemoveProceedRecipientNestJSEventAdapter } from "@port/bond/usecase/removeproceedrecipient/RemoveProceedRecipientNestJSEventAdapter"
import { RemoveProceedRecipientCommandHandler } from "@app/bond/removeproceedrecipient/command/RemoveProceedRecipientCommandHandler"
import { RemoveBondProceedRecipientDomainService } from "@domain/bond/proceedrecipient/service/RemoveBondProceedRecipientDomainService"
import { PauseBondCommandHandler } from "@app/bond/pausebond/command/PauseBondCommandHandler"
import { UnpauseBondCommandHandler } from "@app/bond/unpausebond/command/UnpauseBondCommandHandler"
import { PauseBondNestJSEventAdapter } from "@port/bond/usecase/pausebond/PauseBondNestJSEventAdapter"
import { UnpauseBondNestJSEventAdapter } from "@port/bond/usecase/unpausebond/UnpauseBondNestJSEventAdapter"
import { GetControlListMembersHttpAdapter } from "@port/bond/usecase/getcontrollistmembers/GetControlListMembersHttpAdapter"
import { GetControlListMembersQueryHandler } from "@app/bond/getcontrollistmembers/query/GetControlListMembersQueryHandler"
import { GetBondDocumentsHttpAdapter } from "@port/bond/usecase/getbonddocuments/GetBondDocumentsHttpAdapter"
import { GetBondDocumentsQueryHandler } from "@app/bond/getbonddocuments/query/GetBondDocumentsQueryHandler"
import { RedeemBondTransactionHttpAdapter } from "@port/transaction/usecase/redeembondtransaction/RedeemBondTransactionHttpAdapter"
import { RedeemBondTransactionAppService } from "@app/bond/transaction/redeembondtransaction/service/RedeemBondTransactionAppService"
import { RedeemBondHolderBalanceCommandHandler } from "@app/bond/redeembondholderbalance/command/RedeemBondHolderBalanceCommandHandler"
import { RedeemBondHolderBalanceNestJSEventAdapter } from "@port/bond/usecase/redeembondholderbalance/RedeemBondHolderBalanceNestJSEventAdapter"
import { RedeemBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/RedeemBondHolderBalanceDomainService"
import { TransferByPartitionTransactionHttpAdapter } from "@port/transaction/usecase/transferbypartitiontransaction/TransferByPartitionTransactionHttpAdapter"
import { TransferByPartitionTransactionAppService } from "@app/bond/transaction/transferbypartitiontransaction/service/TransferByPartitionTransactionAppService"
import { TransferByPartitionNestJSEventAdapter } from "@port/bond/usecase/transferbypartition/TransferByPartitionNestJSEventAdapter"
import { TransferByPartitionCommandHandler } from "@app/bond/transferbypartition/command/TransferByPartitionCommandHandler"
import { TransferBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/TransferBondHolderBalanceDomainService"
import { CreateBondHoldTransactionHttpAdapter } from "@port/transaction/usecase/createbondholdtransaction/CreateBondHoldTransactionHttpAdapter"
import { CreateBondHoldTransactionAppService } from "@app/bond/transaction/createbondholdtransaction/service/CreateBondHoldTransactionAppService"
import { CreateBondHoldCommandHandler } from "@app/bond/createbondhold/command/CreateBondHoldCommandHandler"
import { CreateBondHoldNestJSEventAdapter } from "@port/bond/usecase/createbondhold/CreateBondHoldNestJSEventAdapter"
import { CreateBondHoldDomainService } from "@domain/bond/hold/service/CreateBondHoldDomainService"
import { DeleteBondHoldDomainService } from "@domain/bond/hold/service/DeleteBondHoldDomainService"
import { BondHoldPersistence } from "@port/bond/persistence/model/BondHoldPersistence"
import { BondHoldTypeOrmRepository } from "@port/bond/persistence/repositories/BondHoldTypeOrmRepository"
import { ClearingHoldTypeOrmRepository } from "@port/bond/persistence/repositories/ClearingHoldTypeOrmRepository"
import { CreateClearingHoldTransactionHttpAdapter } from "@port/transaction/usecase/createclearingholdtransaction/CreateClearingHoldTransactionHttpAdapter"
import { CreateClearingHoldTransactionAppService } from "@app/bond/transaction/createclearingholdtransaction/service/CreateClearingHoldTransactionAppService"
import { CreateClearingRedeemTransactionHttpAdapter } from "@port/transaction/usecase/createclearingredeemtransaction/CreateClearingRedeemTransactionHttpAdapter"
import { CreateClearingRedeemTransactionAppService } from "@app/bond/transaction/createclearingredeemtransaction/service/CreateClearingRedeemTransactionAppService"
import { CreateClearingTransferTransactionHttpAdapter } from "@port/transaction/usecase/createclearingtransfertransaction/CreateClearingTransferTransactionHttpAdapter"
import { CreateClearingTransferTransactionAppService } from "@app/bond/transaction/createclearingtransfertransaction/service/CreateClearingTransferTransactionAppService"
import { UpdateClearingStatusTransactionHttpAdapter } from "@port/transaction/usecase/updateclearingstatustransaction/UpdateClearingStatusTransactionHttpAdapter"
import { UpdateClearingHoldTransactionAppService } from "@app/bond/transaction/updateclearingholdtransaction/service/UpdateClearingHoldTransactionAppService"
import { ExecuteHoldHttpAdapter } from "@port/transaction/usecase/executeholdtransaction/ExecuteHoldHttpAdapter"
import { ExecuteHoldAppService } from "@app/bond/transaction/executeholdtransaction/service/ExecuteHoldAppService"
import { ReleaseHoldHttpAdapter } from "@port/transaction/usecase/releaseholdtransaction/ReleaseHoldHttpAdapter"
import { ReleaseHoldAppService } from "@app/bond/transaction/releaseholdtransaction/service/ReleaseHoldAppService"
import { ReclaimHoldHttpAdapter } from "@port/transaction/usecase/reclaimholdtransaction/ReclaimHoldHttpAdapter"
import { ReclaimHoldAppService } from "@app/bond/transaction/reclaimholdtransaction/service/ReclaimHoldAppService"
import { ExecuteBondHoldCommandHandler } from "@app/bond/executebondhold/command/ExecuteBondHoldCommandHandler"
import { ReleaseBondHoldCommandHandler } from "@app/bond/releasebondhold/command/ReleaseBondHoldCommandHandler"
import { ReclaimBondHoldCommandHandler } from "@app/bond/reclaimbondhold/command/ReclaimBondHoldCommandHandler"
import { ExecutedHoldByPartitionNestJSEventAdapter } from "@port/bond/usecase/executedholdbypartition/ExecutedHoldByPartitionNestJSEventAdapter"
import { ReleasedHoldByPartitionNestJSEventAdapter } from "@port/bond/usecase/releasedholdbypartition/ReleasedHoldByPartitionNestJSEventAdapter"
import { ReclaimedHoldByPartitionNestJSEventAdapter } from "@port/bond/usecase/reclaimedholdbypartition/ReclaimedHoldByPartitionNestJSEventAdapter"
import { CancelClearingTransactionHttpAdapter } from "@port/transaction/usecase/cancelclearingtransaction/CancelClearingTransactionHttpAdapter"
import { CancelClearingTransactionAppService } from "@app/bond/transaction/cancelclearingtransaction/service/CancelClearingTransactionAppService"
import { GetClearingsHoldHttpAdapter } from "@port/bond/usecase/getclearingshold/GetClearingsHoldHttpAdapter"
import { GetClearingHoldHttpAdapter } from "@port/bond/usecase/getclearinghold/GetClearingHoldHttpAdapter"
import { GetClearingsTransferHttpAdapter } from "@port/bond/usecase/getclearingstransfer/GetClearingsTransferHttpAdapter"
import { GetClearingTransferHttpAdapter } from "@port/bond/usecase/getclearingtransfer/GetClearingTransferHttpAdapter"
import { GetClearingsRedeemHttpAdapter } from "@port/bond/usecase/getclearingsredeem/GetClearingsRedeemHttpAdapter"
import { GetClearingRedeemHttpAdapter } from "@port/bond/usecase/getclearingredeem/GetClearingRedeemHttpAdapter"
import { CreateClearingHoldDomainService } from "@domain/bond/clearing/service/CreateClearingHoldDomainService"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingRedeemStatusDomainService"
import { DeleteClearingHoldDomainService } from "@domain/bond/clearing/service/DeleteClearingHoldDomainService"
import { DeleteClearingRedeemDomainService } from "@domain/bond/clearing/service/DeleteClearingRedeemDomainService"
import { GetClearingsHoldDomainService } from "@domain/bond/clearing/service/GetClearingsHoldDomainService"
import { GetClearingHoldByIdDomainService } from "@domain/bond/clearing/service/GetClearingHoldByIdDomainService"
import { GetClearingsTransferDomainService } from "@domain/bond/clearing/service/GetClearingsTransferDomainService"
import { GetClearingTransferByIdDomainService } from "@domain/bond/clearing/service/GetClearingTransferByIdDomainService"
import { GetClearingsRedeemDomainService } from "@domain/bond/clearing/service/GetClearingsRedeemDomainService"
import { GetClearingRedeemByIdDomainService } from "@domain/bond/clearing/service/GetClearingRedeemByIdDomainService"
import { GetClearingsHoldQueryHandler } from "@app/bond/getclearingshold/query/GetClearingsHoldQueryHandler"
import { GetClearingHoldQueryHandler } from "@app/bond/getclearinghold/query/GetClearingHoldQueryHandler"
import { GetClearingsTransferQueryHandler } from "@app/bond/getclearingstransfer/query/GetClearingsTransferQueryHandler"
import { GetClearingTransferQueryHandler } from "@app/bond/getclearingtransfer/query/GetClearingTransferQueryHandler"
import { GetClearingsRedeemQueryHandler } from "@app/bond/getclearingsredeem/query/GetClearingsRedeemQueryHandler"
import { GetClearingRedeemQueryHandler } from "@app/bond/getclearingredeem/query/GetClearingRedeemQueryHandler"
import { ClearedHoldNestJSEventAdapter } from "@port/bond/usecase/clearedhold/ClearedHoldNestJSEventAdapter"
import {
  ClearingOperationApprovedNestJSEventAdapter,
  ClearingOperationReclaimedNestJSEventAdapter,
} from "@port/bond/usecase/updateclearingoperation/UpdateClearingOperationNestJSEventAdapter"
import { CancelClearingOperationNestJSEventAdapter } from "@port/bond/usecase/cancelclearingoperation/CancelClearingOperationNestJSEventAdapter"
import { BondClearingHoldPersistence } from "@port/bond/persistence/model/BondClearingHoldPersistence"
import { BondClearingRedeemPersistence } from "@port/bond/persistence/model/BondClearingRedeemPersistence"
import { BondClearingTransferPersistence } from "@port/bond/persistence/model/BondClearingTransferPersistence"
import { CreateClearingHoldCommandHandler } from "@app/bond/createclearinghold/command/CreateClearingHoldCommandHandler"
import { CreateClearingRedeemCommandHandler } from "@app/bond/createclearingredeem/command/CreateClearingRedeemCommandHandler"
import { CreateClearingTransferCommandHandler } from "@app/bond/createclearingtransfer/command/CreateClearingTransferCommandHandler"
import { ClearedRedeemNestJSEventAdapter } from "@port/bond/usecase/clearedredeem/ClearedRedeemNestJSEventAdapter"
import { ClearedTransferNestJSEventAdapter } from "@port/bond/usecase/clearedtransfer/ClearedTransferNestJSEventAdapter"
import { ClearingRedeemTypeOrmRepository } from "@port/bond/persistence/repositories/ClearingRedeemTypeOrmRepository"
import { ClearingTransferTypeOrmRepository } from "@port/bond/persistence/repositories/ClearingTransferTypeOrmRepository"
import { CreateClearingRedeemDomainService } from "@domain/bond/clearing/service/CreateClearingRedeemDomainService"
import { GetRoleMembersHttpAdapter } from "@port/bond/usecase/getrolemembers/GetRoleMembersHttpAdapter"
import { GetUserRolesHttpAdapter } from "@port/bond/usecase/getuserroles/GetUserRolesHttpAdapter"
import { GrantRoleTransactionHttpAdapter } from "@port/transaction/usecase/grantrole/GrantRoleTransactionHttpAdapter"
import { RevokeRoleTransactionHttpAdapter } from "@port/transaction/usecase/revokerole/RevokeRoleTransactionHttpAdapter"
import { GrantRoleNestJSEventAdapter } from "@port/bond/usecase/grantrole/GrantRoleNestJSEventAdapter"
import { RevokeRoleNestJSEventAdapter } from "@port/bond/usecase/revokerole/RevokeRoleNestJSEventAdapter"
import { CreateClearingTransferDomainService } from "@domain/bond/clearing/service/CreateClearingTransferDomainService"
import { UpdateClearingTransferStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingTransferStatusDomainService"
import { DeleteClearingTransferDomainService } from "@domain/bond/clearing/service/DeleteClearingTransferDomainService"
import { ApproveHoldClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveHoldClearingBalanceDomainService"
import { ApproveRedeemClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveRedeemClearingBalanceDomainService"
import { ApproveTransferClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveTransferClearingBalanceDomainService"

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
  GetClearingsTransferHttpAdapter,
  GetClearingTransferHttpAdapter,
  GetClearingsRedeemHttpAdapter,
  GetClearingRedeemHttpAdapter,
]
export const PROVIDERS = [
  ...REPOSITORIES,
  ...COMMON_FUNCTIONALITY_PROVIDERS,
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
]
