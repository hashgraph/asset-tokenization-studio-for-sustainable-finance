// SPDX-License-Identifier: Apache-2.0
import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"
import { BuildSetBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondDocumentTransactionRequest"
import { BuildSetBondCapTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondCapTransactionRequest"
import { BuildRemoveBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveBondDocumentTransactionRequest"
import { BuildAddControlListMemberTransactionRequest } from "@port/transactionbuilder/model/BuildAddControlListMemberTransactionRequest"
import { BuildRemoveControlListMemberTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveControlListMemberTransactionRequest"
import { BuildSetCouponTransactionRequest } from "@port/transactionbuilder/model/BuildSetCouponTransactionRequest"
import { BuildCreateBondLockTransactionRequest } from "@port/transactionbuilder/model/BuildCreateBondLockTransactionRequest"
import { BuildMintBondTransactionRequest } from "@port/transactionbuilder/model/BuildMintBondTransactionRequest"
import { BuildReleaseBondLockTransactionRequest } from "@port/transactionbuilder/model/BuildReleaseBondLockTransactionRequest"
import { BuildAddProceedRecipientTransactionRequest } from "@port/transactionbuilder/model/BuildAddProceedRecipientTransactionRequest"
import { BuildRemoveProceedRecipientTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveProceedRecipientTransactionRequest"
import { BuildTransferByPartitionTransactionRequest } from "@port/transactionbuilder/model/BuildTransferByPartitionTransactionRequest"
import { BuildCreateBondHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCreateBondHoldTransactionRequest"
import { BuildApproveClearingTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingTransactionRequest"
import { BuildCancelClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingTransactionRequest"
import { BuildReclaimClearingTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingTransactionRequest"
import { BuildRedeemBondTransactionRequest } from "@port/transactionbuilder/model/BuildRedeemBondTransactionRequest"
import { BuildCreateClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingHoldTransactionRequest"
import { BuildCreateClearingRedeemTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingRedeemTransactionRequest"
import { BuildCreateClearingTransferTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingTransferTransactionRequest"
import { BuildExecuteHoldTransactionRequest } from "@port/transactionbuilder/model/BuildExecuteHoldTransactionRequest"
import { BuildReleaseHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReleaseHoldTransactionRequest"
import { BuildReclaimHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimHoldTransactionRequest"
import { BuildSetInterestRateTransactionRequest } from "@port/transactionbuilder/model/BuildSetInterestRateTransactionRequest"
import { BuildSetImpactDataTransactionRequest } from "@port/transactionbuilder/model/BuildSetImpactDataTransactionRequest"
import { BuildAddKpiDataTransactionRequest } from "@port/transactionbuilder/model/BuildAddKpiDataTransactionRequest"

export interface TransactionBuilderPort {
  createBondTransaction(request: BuildCreateBondTransactionRequest): Promise<BuildTransactionResponse>
  setBondDocumentTransaction(request: BuildSetBondDocumentTransactionRequest): Promise<BuildTransactionResponse>
  removeBondDocumentTransaction(request: BuildRemoveBondDocumentTransactionRequest): Promise<BuildTransactionResponse>
  setBondCapTransaction(request: BuildSetBondCapTransactionRequest): Promise<BuildTransactionResponse>
  addControlListMemberTransaction(
    request: BuildAddControlListMemberTransactionRequest,
  ): Promise<BuildTransactionResponse>
  removeControlListMemberTransaction(
    request: BuildRemoveControlListMemberTransactionRequest,
  ): Promise<BuildTransactionResponse>
  setBondCouponTransaction(request: BuildSetCouponTransactionRequest): Promise<BuildTransactionResponse>
  createBondLockTransaction(request: BuildCreateBondLockTransactionRequest): Promise<BuildTransactionResponse>
  mintBondTransaction(request: BuildMintBondTransactionRequest): Promise<BuildTransactionResponse>
  releaseBondLockTransaction(request: BuildReleaseBondLockTransactionRequest): Promise<BuildTransactionResponse>
  addProceedRecipientTransaction(request: BuildAddProceedRecipientTransactionRequest): Promise<BuildTransactionResponse>
  removeProceedRecipientTransaction(
    request: BuildRemoveProceedRecipientTransactionRequest,
  ): Promise<BuildTransactionResponse>
  transferByPartitionTransaction(request: BuildTransferByPartitionTransactionRequest): Promise<BuildTransactionResponse>
  createBondHoldTransaction(request: BuildCreateBondHoldTransactionRequest): Promise<BuildTransactionResponse>
  redeemBondTransaction(request: BuildRedeemBondTransactionRequest): Promise<BuildTransactionResponse>
  createClearingHoldTransaction(request: BuildCreateClearingHoldTransactionRequest): Promise<BuildTransactionResponse>
  createClearingRedeemTransaction(
    request: BuildCreateClearingRedeemTransactionRequest,
  ): Promise<BuildTransactionResponse>
  createClearingTransferTransaction(
    request: BuildCreateClearingTransferTransactionRequest,
  ): Promise<BuildTransactionResponse>
  approveClearingTransaction(request: BuildApproveClearingTransactionRequest): Promise<BuildTransactionResponse>
  cancelClearingTransaction(request: BuildCancelClearingTransactionRequest): Promise<BuildTransactionResponse>
  reclaimClearingTransaction(request: BuildReclaimClearingTransactionRequest): Promise<BuildTransactionResponse>
  executeHoldTransaction(request: BuildExecuteHoldTransactionRequest): Promise<BuildTransactionResponse>
  releaseHoldTransaction(request: BuildReleaseHoldTransactionRequest): Promise<BuildTransactionResponse>
  reclaimHoldTransaction(request: BuildReclaimHoldTransactionRequest): Promise<BuildTransactionResponse>
  setInterestRateTransaction(request: BuildSetInterestRateTransactionRequest): Promise<BuildTransactionResponse>
  setImpactDataTransaction(request: BuildSetImpactDataTransactionRequest): Promise<BuildTransactionResponse>
  addKpiDataTransaction(request: BuildAddKpiDataTransactionRequest): Promise<BuildTransactionResponse>
}
