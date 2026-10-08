// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { RemoveEnvironmentalAssetTransactionAppServiceRequest } from "./model/RemoveEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class RemoveEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(request: RemoveEnvironmentalAssetTransactionAppServiceRequest): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.removeEnvironmentalAsset(request)
  }
}
