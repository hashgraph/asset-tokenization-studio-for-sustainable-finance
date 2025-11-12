// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { Validate } from "@decorators/Validate"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"
import { ApplyRolesTransactionAppServiceRequest } from "./model/ApplyRolesTransactionAppServiceRequest"

@Singleton()
export class ApplyRolesTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: ApplyRolesTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.applyRoles(request)
  }
}
