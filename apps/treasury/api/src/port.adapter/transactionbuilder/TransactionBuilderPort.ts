// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionBuilderPort, BuildTransactionResponse, PageResponse } from "@hashgraph/green-bonds-shared-core"

import { BuildFundProceedsRecipientTransactionRequest } from "./model/BuildFundProceedsRecipientTransactionRequest"
import { BuildAddEnvironmentalAssetTransactionRequest } from "./model/BuildAddEnvironmentalAssetTransactionRequest"
import { BuildRemoveEnvironmentalAssetTransactionRequest } from "./model/BuildRemoveEnvironmentalAssetTransactionRequest"
import { BuildTransferEnvironmentalAssetTransactionRequest } from "./model/BuildTransferEnvironmentalAssetTransactionRequest"
import { BuildExternalTransferPaymentTokenTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferPaymentTokenTransactionRequest"
import { BuildUpdatePaymentTokenTransactionRequest } from "./model/BuildUpdatePaymentTokenTransactionRequest"
import { BuildExternalTransferEnvironmentalAssetTransactionRequest } from "@port/transactionbuilder/model/BuildExternalTransferEnvironmentalAssetTransactionRequest"
import { BuildTransferPaymentTokenTransactionRequest } from "./model/BuildTransferPaymentTokenTransactionRequest"
import { BuildPauseTreasuryTransactionRequest } from "./model/BuildPauseTreasuryTransactionRequest"
import { BuildUnpauseTreasuryTransactionRequest } from "./model/BuildUnpauseTreasuryTransactionRequest"
import { BuildExecuteDistributionTransactionRequest } from "./model/BuildExecuteDistributionTransactionRequest"
import { BuildExecuteDistributionByAddressesTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteDistributionByAddressesTransactionRequest"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { BuildDissociateTokenTransactionRequest } from "./model/BuildDissociateTokenTransactionRequest"
import { BuildExecuteRedemptionTransactionRequest } from "./model/BuildExecuteRedemptionTransactionRequest"
import { BuildExecuteBondRedemptionByAddressesTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteBondRedemptionByAddressesTransactionRequest"

export interface TransactionBuilderPort extends BaseTransactionBuilderPort {
  fundProceedsRecipient(request: BuildFundProceedsRecipientTransactionRequest): Promise<BuildTransactionResponse>
  addEnvironmentalAsset(request: BuildAddEnvironmentalAssetTransactionRequest): Promise<BuildTransactionResponse>
  removeEnvironmentalAsset(request: BuildRemoveEnvironmentalAssetTransactionRequest): Promise<BuildTransactionResponse>
  transferEnvironmentalAsset(
    request: BuildTransferEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse>
  externalTransferPaymentToken(
    request: BuildExternalTransferPaymentTokenTransactionRequest,
  ): Promise<BuildTransactionResponse>
  updatePaymentToken(request: BuildUpdatePaymentTokenTransactionRequest): Promise<BuildTransactionResponse>
  externalTransferEnvironmentalAsset(
    request: BuildExternalTransferEnvironmentalAssetTransactionRequest,
  ): Promise<BuildTransactionResponse>
  transferPaymentToken(request: BuildTransferPaymentTokenTransactionRequest): Promise<BuildTransactionResponse>
  unpauseTreasury(request: BuildUnpauseTreasuryTransactionRequest): Promise<BuildTransactionResponse>
  pauseTreasury(request: BuildPauseTreasuryTransactionRequest): Promise<BuildTransactionResponse>
  executeDistribution(request: BuildExecuteDistributionTransactionRequest): Promise<PageResponse<string>>
  executeDistributionByAddresses(
    request: BuildExecuteDistributionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse>
  executeRedemption(request: BuildExecuteRedemptionTransactionRequest): Promise<PageResponse<string>>
  dissociateToken(request: BuildDissociateTokenTransactionRequest): Promise<BuildTransactionResponse>
  executeBondRedemptionByAddresses(
    request: BuildExecuteBondRedemptionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse>
}
