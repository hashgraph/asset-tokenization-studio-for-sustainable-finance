// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { TransferEnvironmentalAssetTransactionAppServiceRequest } from "./model/TransferEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class TransferEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(
    request: TransferEnvironmentalAssetTransactionAppServiceRequest,
  ): Promise<TransactionAppServiceResponse> {
    return await this.transactionBuilderPort.transferEnvironmentalAsset(request)
  }
}
