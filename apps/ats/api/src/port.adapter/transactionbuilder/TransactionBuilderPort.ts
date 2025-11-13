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
}
