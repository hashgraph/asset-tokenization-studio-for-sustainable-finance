import { CreateBondTransactionHttpAdapter } from "@port/transaction/usecase/createbondtransaction/CreateBondTransactionHttpAdapter"
import { CreateBondTransactionAppService } from "@app/bond/transaction/createbondtransaction/service/CreateBondTransactionAppService"
import { AppService } from "./AppService"
import { AppController } from "./AppController"
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
import { LockBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/LockBondHolderBalanceDomainService"
import {
  COMMON_FUNCTIONALITY_ENTITIES,
  COMMON_FUNCTIONALITY_PROVIDERS,
  TypeOrmTransactionManager,
} from "@hashgraph/green-bonds-shared-core"
import { ReleaseBondLockTransactionHttpAdapter } from "@port/transaction/usecase/releasebondlocktransaction/ReleaseBondLockTransactionHttpAdapter"
import { ReleaseBondLockTransactionAppService } from "@app/bond/transaction/releasebondlocktransaction/service/ReleaseBondLockTransactionAppService"
import { ReleaseBondLockCommandHandler } from "@app/bond/releasebondlock/command/ReleaseBondLockCommandHandler"
import { ReleaseBondLockNestJSEventAdapter } from "@port/bond/usecase/releasebondlock/ReleaseBondLockNestJSEventAdapter"
import { DeleteBondLockDomainService } from "@domain/bond/lock/service/DeleteBondLockDomainService"
import { UnlockBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UnlockBondHolderBalanceDomainService"
import { GetBondLocksHttpAdapter } from "@port/bond/usecase/getbondlocks/GetBondLocksHttpAdapter"
import { GetBondLocksQueryHandler } from "@app/bond/getbondlocks/query/GetBondLocksQueryHandler"
import { GetBondLockHttpAdapter } from "@port/bond/usecase/getbondlock/GetBondLockHttpAdapter"
import { GetBondLockQueryHandler } from "@app/bond/getbondlock/query/GetBondLockQueryHandler"
import { GetBondHoldersHttpAdapter } from "@port/bond/usecase/getbondholders/GetBondHoldersHttpAdapter"
import { GetBondHoldersQueryHandler } from "@app/bond/getbondholders/query/GetBondHoldersQueryHandler"
import { PauseBondTransactionHttpAdapter } from "@port/transaction/usecase/pausebond/PauseBondTransactionHttpAdapter"
import { UnpauseBondTransactionHttpAdapter } from "@port/transaction/usecase/unpausebond/UnpauseBondTransactionHttpAdapter"
import { PauseBondCommandHandler } from "@app/bond/pausebond/command/PauseBondCommandHandler"
import { UnpauseBondCommandHandler } from "@app/bond/unpausebond/command/UnpauseBondCommandHandler"
import { PauseBondNestJSEventAdapter } from "@port/bond/usecase/pausebond/PauseBondNestJSEventAdapter"
import { UnpauseBondNestJSEventAdapter } from "@port/bond/usecase/unpausebond/UnpauseBondNestJSEventAdapter"
import { GetControlListMembersHttpAdapter } from "@port/bond/usecase/getcontrollistmembers/GetControlListMembersHttpAdapter"
import { GetControlListMembersQueryHandler } from "@app/bond/getcontrollistmembers/query/GetControlListMembersQueryHandler"
import { TransferByPartitionTransactionHttpAdapter } from "@port/transaction/usecase/transferbypartitiontransaction/TransferByPartitionTransactionHttpAdapter"
import { TransferByPartitionTransactionAppService } from "@app/bond/transaction/transferbypartitiontransaction/service/TransferByPartitionTransactionAppService"
import { TransferByPartitionNestJSEventAdapter } from "@port/bond/usecase/transferbypartition/TransferByPartitionNestJSEventAdapter"
import { TransferByPartitionCommandHandler } from "@app/bond/transferbypartition/command/TransferByPartitionCommandHandler"
import { TransferBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/TransferBondHolderBalanceDomainService"

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
]

export const CONTROLLERS = [
  AppController,
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
  GetBondLocksHttpAdapter,
  GetBondLockHttpAdapter,
  GetBondHoldersHttpAdapter,
  GetControlListMembersHttpAdapter,
  CreateBondLockTransactionHttpAdapter,
  MintBondTransactionHttpAdapter,
  ReleaseBondLockTransactionHttpAdapter,
  PauseBondTransactionHttpAdapter,
  UnpauseBondTransactionHttpAdapter,
  TransferByPartitionTransactionHttpAdapter,
]
export const PROVIDERS = [
  ...REPOSITORIES,
  ...COMMON_FUNCTIONALITY_PROVIDERS,
  AppService,
  CreateBondTransactionAppService,
  CreateBondNestJSEventAdapter,
  CreateBondDomainService,
  CreateBondCommandHandler,
  GetBondQueryHandler,
  CheckBondExistsDomainService,
  GetBondsQueryHandler,
  GetBondCouponsQueryHandler,
  GetBondCouponQueryHandler,
  GetBondLocksQueryHandler,
  GetBondLockQueryHandler,
  GetBondHoldersQueryHandler,
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
  LockBondHolderBalanceDomainService,
  ReleaseBondLockTransactionAppService,
  ReleaseBondLockCommandHandler,
  ReleaseBondLockNestJSEventAdapter,
  DeleteBondLockDomainService,
  UnlockBondHolderBalanceDomainService,
  PauseBondCommandHandler,
  UnpauseBondCommandHandler,
  PauseBondNestJSEventAdapter,
  UnpauseBondNestJSEventAdapter,
  TransferByPartitionTransactionAppService,
  TransferByPartitionCommandHandler,
  TransferByPartitionNestJSEventAdapter,
  TransferBondHolderBalanceDomainService,
  CreateBondFiltersAdapter,
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
]
