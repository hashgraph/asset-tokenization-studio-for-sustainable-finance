// SPDX-License-Identifier: Apache-2.0

import { GrantRoleTransactionAppServiceRequest } from "./model/GrantRoleTransactionAppServiceRequest"
import { Validate } from "@decorators/Validate"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"

@Singleton()
export class GrantRoleTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: GrantRoleTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.grantRole(request)
  }
}
