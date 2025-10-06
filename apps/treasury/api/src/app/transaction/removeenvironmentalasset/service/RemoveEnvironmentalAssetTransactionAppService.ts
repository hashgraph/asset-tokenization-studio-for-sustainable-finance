// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { RemoveEnvironmentalAssetTransactionAppServiceRequest } from "./model/RemoveEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class RemoveEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  execute(request: RemoveEnvironmentalAssetTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.removeEnvironmentalAsset(request)
  }
}
