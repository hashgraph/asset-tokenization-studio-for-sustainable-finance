// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "../../../../port.adapter/transactionbuilder/TransactionBuilderPort"
import { PauseTreasuryTransactionAppServiceRequest } from "./model/PauseTreasuryTransactionAppServiceRequest"

@Singleton()
export class PauseTreasuryTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(request: PauseTreasuryTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.pauseTreasury(request)
  }
}
