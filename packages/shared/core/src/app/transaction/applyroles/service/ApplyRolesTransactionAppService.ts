// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@decorators/Singleton"
import { Inject } from "@decorators/Inject"
import { Validate } from "@decorators/Validate"
import { BaseTransactionBuilderPort } from "@transaction/BaseTransactionBuilderPort"
import { TransactionAppServiceResponse } from "@transaction/model/TransactionAppServiceResponse"
import { ApplyRolesTransactionAppServiceRequest } from "./model/ApplyRolesTransactionAppServiceRequest"
import { BuildApplyRolesTransactionRequest } from "@transaction/model/BuildApplyRolesTransactionRequest"

@Singleton()
export class ApplyRolesTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: BaseTransactionBuilderPort) {}

  @Validate()
  async execute(request: ApplyRolesTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    const { rolesToGrant = [], rolesToRevoke = [] } = request
    const roles = [...rolesToGrant, ...rolesToRevoke]
    const actives = [...Array(rolesToGrant.length).fill(true), ...Array(rolesToRevoke.length).fill(false)]

    const buildRequest = new BuildApplyRolesTransactionRequest(request.format, request.accountId, request.contractId)
    buildRequest.roles = roles
    buildRequest.actives = actives
    buildRequest.userAccountId = request.userAccountId

    return await this.transactionBuilderPort.applyRoles(buildRequest)
  }
}
