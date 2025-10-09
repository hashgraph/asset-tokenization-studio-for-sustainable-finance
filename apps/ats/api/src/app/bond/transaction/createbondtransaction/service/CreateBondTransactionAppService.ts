import { Inject, Singleton, TransactionAppServiceResponse } from '@hashgraph/green-bonds-shared-core'
import { CreateBondTransactionAppServiceRequest } from '@app/bond/transaction/createbondtransaction/service/model/CreateBondTransactionAppServiceRequest'
import type { TransactionBuilderPort } from '@port/transactionbuilder/TransactionBuilderPort'

@Singleton()
export class CreateBondTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: CreateBondTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.createBondTransaction(request)
  }
}
