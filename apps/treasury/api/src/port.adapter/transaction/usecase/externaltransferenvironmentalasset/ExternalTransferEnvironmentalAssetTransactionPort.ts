// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transaction/usecase/externaltransferenvironmentalasset/model/ExternalTransferEnvironmentalAssetTransactionRequest"

export interface ExternalTransferEnvironmentalAssetTransactionPort {
  externalTransferEnvironmentalAsset(
    environmentalAssetContractId: string,
    treasuryContractId: string,
    request: ExternalTransferEnvironmentalAssetTransactionRequest,
  ): TransactionResponse
}
