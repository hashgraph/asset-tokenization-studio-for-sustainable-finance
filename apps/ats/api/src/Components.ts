import {
  CreateBondTransactionHttpAdapter
} from "@port/transaction/usecase/createbondtransaction/CreateBondTransactionHttpAdapter"
import {
  CreateBondTransactionAppService
} from "@app/bond/transaction/createbondtransaction/service/CreateBondTransactionAppService"
import {AppService} from "./AppService"
import {AppController} from "./AppController"
import {TransactionBuilderAdapter} from "@port/transactionbuilder/TransactionBuilderAdapter"
import {EVENT_LISTENER_ENTITIES} from "@hashgraph/green-bonds-blockchain-listener"
import {BondPersistence} from "@port/bond/persistence/model/BondPersistence"
import {CreateBondNestJSEventAdapter} from "@port/bond/usecase/createbond/CreateBondNestJSEventAdapter"
import {CreateBondDomainService} from "@domain/bond/services/CreateBondDomainService"
import {BondTypeOrmRepository} from "@port/bond/persistence/repositories/BondTypeOrmRepository"
import {Provider} from "@nestjs/common"
import {GetBondHttpAdapter} from "@port/bond/usecase/getbond/GetBondHttpAdapter"
import {CheckBondExistsDomainService} from "@domain/bond/services/CheckBondExistsDomainService"
import {GetBondsHttpAdapter} from "@port/bond/usecase/getbonds/GetBondsHttpAdapter"
import {CreateBondCommandHandler} from "@app/bond/createbond/command/CreateBondCommandHandler"
import {GetBondQueryHandler} from "@app/bond/getbond/query/GetBondQueryHandler"
import {GetBondsQueryHandler} from "@app/bond/getbonds/query/GetBondsQueryHandler"
import {
  SetBondDocumentTransactionHttpAdapter
} from "@port/transaction/usecase/setbonddocumenttransaction/SetBondDocumentTransactionHttpAdapter";
import {
  SetBondDocumentTransactionAppService
} from "@app/bond/transaction/setbonddocumenttransaction/service/SetBondDocumentTransactionAppService";
import {SetBondDocumentCommandHandler} from "@app/bond/setbonddocument/command/SetBondDocumentCommandHandler";
import {SetBondDocumentNestJSEventAdapter} from "@port/bond/usecase/setbonddocument/SetBondDocumentNestJSEventAdapter";
import {SetBondDocumentDomainService} from "@domain/bond/document/service/SetBondDocumentDomainService";
import {BondDocumentPersistence} from "@port/bond/persistence/model/BondDocumentPersistence";
import {BondDocumentTypeOrmRepository} from "@port/bond/persistence/repositories/BondDocumentTypeOrmRepository";
import {CreateBondFiltersAdapter} from "@port/bond/usecase/createbondfilters/CreateBondFiltersAdapter";

const REPOSITORIES: Provider[] = [
  {
    provide: "BondRepository",
    useClass: BondTypeOrmRepository,
  },
  {
    provide: "BondDocumentRepository",
    useClass: BondDocumentTypeOrmRepository,
  },
]

export const CONTROLLERS = [AppController, CreateBondTransactionHttpAdapter, GetBondHttpAdapter, GetBondsHttpAdapter, SetBondDocumentTransactionHttpAdapter]
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
  CreateBondFiltersAdapter,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, BondPersistence, BondDocumentPersistence]
