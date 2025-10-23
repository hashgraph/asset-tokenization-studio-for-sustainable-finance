// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { AddEnvironmentalAssetTransactionAppServiceRequest } from "./model/AddEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class AddEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  async execute(request: AddEnvironmentalAssetTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.addEnvironmentalAsset(request)
  }
}
