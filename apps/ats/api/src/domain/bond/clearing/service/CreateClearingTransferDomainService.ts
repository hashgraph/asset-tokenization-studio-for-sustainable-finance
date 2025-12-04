// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"
import { ClearingStatus } from "../model/ClearingStatus"
import type { ClearingTransferRepository } from "../repository/ClearingTransferRepository"
import { ClearingTransferFoundError } from "../errors/ClearingTransferFoundError"
import { CreateClearingTransferDomainServiceRequest } from "./model/CreateClearingTransferDomainServiceRequest"

@Singleton()
export class CreateClearingTransferDomainService {
  constructor(
    @Inject("ClearingTransferRepository")
    private readonly clearingRepository: ClearingTransferRepository,
  ) {}

  async execute(
    request: CreateClearingTransferDomainServiceRequest,
    transactionId?: string,
  ): Promise<ClearingTransfer> {
    const existingClearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (existingClearing) {
      throw new ClearingTransferFoundError(request.clearingId)
    }
    const clearing = new ClearingTransfer()
    const date = new Date()
    clearing.id = request.clearingId
    clearing.bondContractId = request.bondContractId
    clearing.holderAccountId = request.holderAccountId
    clearing.partition = request.partition
    clearing.amount = request.amount
    clearing.expirationDate = request.expirationDate
    clearing.status = ClearingStatus.PENDING
    clearing.toAccountId = request.toAccountId
    clearing.data = request.data
    clearing.operatorData = request.operatorData
    clearing.operatorAccountId = request.operatorAccountId
    clearing.createdAt = date
    clearing.updatedAt = date

    return await this.clearingRepository.save(clearing, transactionId)
  }
}
