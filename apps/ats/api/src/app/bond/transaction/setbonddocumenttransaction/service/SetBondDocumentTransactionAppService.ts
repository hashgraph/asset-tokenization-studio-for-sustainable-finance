import {Inject, Singleton, TransactionAppServiceResponse} from "@hashgraph/green-bonds-shared-core"
import type {TransactionBuilderPort} from "@port/transactionbuilder/TransactionBuilderPort"
import {
  SetBondDocumentTransactionAppServiceRequest
} from "@app/bond/transaction/setbonddocumenttransaction/service/model/SetBondDocumentTransactionAppServiceRequest";

@Singleton()
export class SetBondDocumentTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: SetBondDocumentTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.setBondDocumentTransaction(request)
  }
}
