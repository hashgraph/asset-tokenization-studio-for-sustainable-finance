// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, TransactionAppServiceResponse, Validate } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { ExternalTransferEnvironmentalAssetTransactionAppServiceRequest } from "@app/transaction/externaltransferenvironmentalasset/service/service/model/ExternalTransferEnvironmentalAssetTransactionAppServiceRequest"

@Singleton()
export class ExternalTransferEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  execute(request: ExternalTransferEnvironmentalAssetTransactionAppServiceRequest): TransactionAppServiceResponse {
    return this.transactionBuilderPort.externalTransferEnvironmentalAsset(request)
  }
}
