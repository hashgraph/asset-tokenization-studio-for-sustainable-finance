// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { UnpauseTransactionAppServiceRequest } from "./model/UnpauseTransactionAppServiceRequest"
import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { Validate } from "@decorators/Validate"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"

@Singleton()
export class UnpauseTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: UnpauseTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.unpause(request)
  }
}
