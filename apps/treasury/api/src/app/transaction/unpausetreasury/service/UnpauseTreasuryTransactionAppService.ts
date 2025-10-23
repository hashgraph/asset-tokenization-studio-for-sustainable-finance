// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { UnpauseTreasuryTransactionAppServiceRequest } from "./model/UnpauseTreasuryTransactionAppServiceRequest"

@Singleton()
export class UnpauseTreasuryTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(request: UnpauseTreasuryTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.unpauseTreasury(request)
  }
}
