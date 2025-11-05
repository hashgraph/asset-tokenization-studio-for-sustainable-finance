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
import { BondControlListMemberPersistence } from "@port/bond/persistence/model/BondControlListMemberPersistence"
import { BondControlListMemberTypeOrmRepository } from "@port/bond/persistence/repositories/BondControlListMemberTypeOrmRepository"

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
]
export const PROVIDERS = [
  ...REPOSITORIES,
  AppService,
  CreateBondTransactionAppService,
  CreateBondNestJSEventAdapter,
  CreateBondDomainService,
  CreateBondCommandHandler,
  GetBondQueryHandler,
  CheckBondExistsDomainService,
  GetBondsQueryHandler,
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
  RemoveControlListMemberTransactionAppService,
  RemoveControlListMemberCommandHandler,
  RemoveControlListMemberNestJSEventAdapter,
  RemoveBondControlListMemberDomainService,
  CreateBondFiltersAdapter,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [
  ...EVENT_LISTENER_ENTITIES,
  BondPersistence,
  BondDocumentPersistence,
  BondControlListMemberPersistence,
]
