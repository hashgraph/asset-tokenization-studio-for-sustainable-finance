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

const REPOSITORIES: Provider[] = [
  {
    provide: "BondRepository",
    useClass: BondTypeOrmRepository,
  },
]

export const CONTROLLERS = [AppController, CreateBondTransactionHttpAdapter, GetBondHttpAdapter, GetBondsHttpAdapter]
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
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]

export const ENTITIES = [...EVENT_LISTENER_ENTITIES, BondPersistence]
