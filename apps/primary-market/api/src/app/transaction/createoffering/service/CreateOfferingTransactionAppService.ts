// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from '@hashgraph/green-bonds-shared-core'
import type { TransactionBuilderPort } from '@port/transactionbuilder/TransactionBuilderPort'
import { CreateOfferingTransactionAppServiceRequest } from './model/CreateOfferingTransactionAppServiceRequest'

@Singleton()
export class CreateOfferingTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: CreateOfferingTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.createOffering(request)
  }
}
