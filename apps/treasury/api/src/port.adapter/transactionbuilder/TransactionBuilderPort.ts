// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"
import { BuildRemoveEnvironmentalAssetTransactionRequest } from "./model/BuildRemoveEnvironmentalAssetTransactionRequest"
import { BuildTransferEnvironmentalAssetTransactionRequest } from "./model/BuildTransferEnvironmentalAssetTransactionRequest"

export interface TransactionBuilderPort {
  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse
  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): BuildTransactionResponse
  removeEnvironmentalAsset(request: BuildRemoveEnvironmentalAssetTransactionRequest): BuildTransactionResponse
  transferEnvironmentalAsset(request: BuildTransferEnvironmentalAssetTransactionRequest): BuildTransactionResponse
}
