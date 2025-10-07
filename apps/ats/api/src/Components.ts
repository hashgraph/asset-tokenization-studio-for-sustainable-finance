import { CreateBondTransactionHttpAdapter } from '@port/transaction/usecase/createbondtransaction/CreateBondTransactionHttpAdapter'
import { CreateBondTransactionAppService } from '@app/bond/transaction/createbondtransaction/CreateBondTransactionAppService'
import { AppService } from './AppService'
import { AppController } from './AppController'
import { TransactionBuilderAdapter } from '@port/transactionbuilder/TransactionBuilderAdapter'

export const CONTROLLERS = [AppController, CreateBondTransactionHttpAdapter]
export const PROVIDERS = [
  AppService,
  CreateBondTransactionAppService,
  {
    provide: 'TransactionBuilderPort',
    useClass: TransactionBuilderAdapter,
  },
]
