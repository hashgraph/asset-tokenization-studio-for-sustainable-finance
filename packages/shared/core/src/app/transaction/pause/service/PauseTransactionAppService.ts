// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { PauseTransactionAppServiceRequest } from "./model/PauseTransactionAppServiceRequest"
import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { Validate } from "@decorators/Validate"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"

@Singleton()
export class PauseTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: PauseTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.pause(request)
  }
}
