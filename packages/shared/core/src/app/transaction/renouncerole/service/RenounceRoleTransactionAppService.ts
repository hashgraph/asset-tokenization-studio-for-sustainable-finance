// SPDX-License-Identifier: Apache-2.0

import { Validate } from "@decorators/Validate"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"
import { RenounceRoleTransactionAppServiceRequest } from "./model/RenounceRoleTransactionAppServiceRequest"

@Singleton()
export class RenounceRoleTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: RenounceRoleTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.renounceRole(request)
  }
}
