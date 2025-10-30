// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate, TransactionAppServiceResponse } from "@hashgraph/green-bonds-shared-core"
import type { TransactionBuilderPort } from "@port/transactionbuilder/TransactionBuilderPort"
import { DissociateEnvironmentalAssetTransactionAppServiceRequest } from "./model/DissociateEnvironmentalAssetTransactionAppServiceRequest"
import { BuildDissociateTokenTransactionRequest } from "@port/transactionbuilder/model/BuildDissociateTokenTransactionRequest"

@Singleton()
export class DissociateEnvironmentalAssetTransactionAppService {
  constructor(@Inject() private readonly transactionBuilderPort: TransactionBuilderPort) {}

  @Validate()
  async execute(
    request: DissociateEnvironmentalAssetTransactionAppServiceRequest,
  ): Promise<TransactionAppServiceResponse> {
    return this.transactionBuilderPort.dissociateToken(
      new BuildDissociateTokenTransactionRequest(
        request.assetContractId,
        request.format,
        request.accountId || "",
        request.contractId,
      ),
    )
  }
}
