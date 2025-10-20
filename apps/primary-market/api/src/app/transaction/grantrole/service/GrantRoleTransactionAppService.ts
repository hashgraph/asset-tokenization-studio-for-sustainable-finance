// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from '@hashgraph/green-bonds-shared-core'
import type { TransactionBuilderPort } from '@port/transactionbuilder/TransactionBuilderPort'
import { GrantRoleTransactionAppServiceRequest } from './model/GrantRoleTransactionAppServiceRequest'

@Singleton()
export class GrantRoleTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: GrantRoleTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.grantRole(request)
  }
}
