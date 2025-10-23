import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondTransactionAppServiceRequest } from "@app/bond/transaction/createbondtransaction/service/model/CreateBondTransactionAppServiceRequest"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"

@Singleton()
export class CreateBondTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: CreateBondTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.createBondTransaction(request)
  }
}
