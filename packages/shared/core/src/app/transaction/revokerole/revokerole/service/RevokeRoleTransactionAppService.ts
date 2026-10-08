// SPDX-License-Identifier: Apache-2.0

import { RevokeRoleTransactionAppServiceRequest } from "./model/RevokeRoleTransactionAppServiceRequest"
import { Validate } from "@decorators/Validate"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"

@Singleton()
export class RevokeRoleTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: RevokeRoleTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.revokeRole(request)
  }
}
