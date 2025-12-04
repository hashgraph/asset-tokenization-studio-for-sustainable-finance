// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import { ClearingStatus } from "../model/ClearingStatus"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"
import { ClearingFoundError } from "../errors/ClearingFoundError"
import { CreateClearingHoldDomainServiceRequest } from "./model/CreateClearingHoldDomainServiceRequest"

@Singleton()
export class CreateClearingHoldDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(request: CreateClearingHoldDomainServiceRequest, transactionId?: string): Promise<ClearingHold> {
    const existingClearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (existingClearing) {
      throw new ClearingFoundError(request.clearingId)
    }
    const clearing = new ClearingHold()
    const date = new Date()
    clearing.id = request.clearingId
    clearing.bondContractId = request.bondContractId
    clearing.holderAccountId = request.holderAccountId
    clearing.partition = request.partition
    clearing.amount = request.amount
    clearing.expirationDate = request.expirationDate
    clearing.status = ClearingStatus.PENDING
    clearing.toAccountId = request.toAddress
    clearing.escrowAccountId = request.escrowAddress
    clearing.data = request.data
    clearing.operatorData = request.operatorData
    clearing.operatorAccountId = request.operator
    clearing.createdAt = date
    clearing.updatedAt = date

    return await this.clearingRepository.save(clearing, transactionId)
  }
}
