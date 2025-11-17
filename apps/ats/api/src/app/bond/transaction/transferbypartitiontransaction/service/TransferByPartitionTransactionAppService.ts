// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { TransferByPartitionTransactionAppServiceRequest } from "@app/bond/transaction/transferbypartitiontransaction/service/model/TransferByPartitionTransactionAppServiceRequest"

@Singleton()
export class TransferByPartitionTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: TransferByPartitionTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.transferByPartitionTransaction(request)
  }
}
