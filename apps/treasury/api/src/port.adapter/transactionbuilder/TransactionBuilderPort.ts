// SPDX-License-Identifier: Apache-2.0

import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"
import { BuildRemoveEnvironmentalAssetTransactionRequest } from "./model/BuildRemoveEnvironmentalAssetTransactionRequest"
import { BuildTransferEnvironmentalAssetTransactionRequest } from "./model/BuildTransferEnvironmentalAssetTransactionRequest"
import { BuildExternalTransferPaymentTokenTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferPaymentTokenTransactionRequest"
import { BuildUpdatePaymentTokenTransactionRequest } from "./model/BuildUpdatePaymentTokenTransactionRequest"
import { BuildExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferEnvironmentalAssetTransactionRequest"
import { BuildTransferPaymentTokenTransactionRequest } from "./model/BuildTransferPaymentTokenTransactionRequest"

export interface TransactionBuilderPort {
  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): BuildTransactionResponse
  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): BuildTransactionResponse
  removeEnvironmentalAsset(request: BuildRemoveEnvironmentalAssetTransactionRequest): BuildTransactionResponse
  transferEnvironmentalAsset(request: BuildTransferEnvironmentalAssetTransactionRequest): BuildTransactionResponse
  externalTransferPaymentToken(request: BuildExternalTransferPaymentTokenTransactionRequest): BuildTransactionResponse
  updatePaymentToken(request: BuildUpdatePaymentTokenTransactionRequest): BuildTransactionResponse
  externalTransferEnvironmentalAsset(
    request: BuildExternalTransferEnvironmentalAssetTransactionRequest,
  ): BuildTransactionResponse
  transferPaymentToken(request: BuildTransferPaymentTokenTransactionRequest): BuildTransactionResponse
}
