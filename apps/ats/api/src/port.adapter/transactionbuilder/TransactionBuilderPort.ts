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
import { BuildCreateClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingTransactionRequest"
import { BuildApproveClearingTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingTransactionRequest"
import { BuildCancelClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingTransactionRequest"
import { BuildReclaimClearingTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingTransactionRequest"
import { BuildCreateClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingHoldTransactionRequest"
import { BuildApproveClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingHoldTransactionRequest"
import { BuildCancelClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingHoldTransactionRequest"
import { BuildReclaimClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingHoldTransactionRequest"
import { BuildRedeemBondTransactionRequest } from "@port/transactionbuilder/model/BuildRedeemBondTransactionRequest"

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
  createClearingTransaction(request: BuildCreateClearingTransactionRequest): Promise<BuildTransactionResponse>
  approveClearingTransaction(
    request: BuildApproveClearingTransactionRequest,
  ): Promise<BuildTransactionResponse>
  cancelClearingTransaction(request: BuildCancelClearingTransactionRequest): Promise<BuildTransactionResponse>
  reclaimClearingTransaction(
    request: BuildReclaimClearingTransactionRequest,
  ): Promise<BuildTransactionResponse>
  createClearingHoldTransaction(request: BuildCreateClearingHoldTransactionRequest): Promise<BuildTransactionResponse>
  approveClearingHoldTransaction(request: BuildApproveClearingHoldTransactionRequest): Promise<BuildTransactionResponse>
  cancelClearingHoldTransaction(request: BuildCancelClearingHoldTransactionRequest): Promise<BuildTransactionResponse>
  reclaimClearingHoldTransaction(request: BuildReclaimClearingHoldTransactionRequest): Promise<BuildTransactionResponse>
  redeemBondTransaction(request: BuildRedeemBondTransactionRequest): Promise<BuildTransactionResponse>
}
