// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { MintBondTransactionAppServiceRequest } from "@app/transaction/bond/mintbondtransaction/service/model/MintBondTransactionAppServiceRequest"

@Singleton()
export class MintBondTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: MintBondTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.mintBondTransaction(request)
  }
}
