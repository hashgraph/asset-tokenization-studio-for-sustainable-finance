// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { TransferEnvironmentalAssetTransactionAppServiceRequest } from "./model/TransferEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class TransferEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  execute(request: TransferEnvironmentalAssetTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.transferEnvironmentalAsset(request)
  }
}
