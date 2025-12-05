// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"
import { ClearingStatus } from "../model/ClearingStatus"
import type { ClearingRedeemRepository } from "../repository/ClearingRedeemRepository"
import { ClearingRedeemFoundError } from "../errors/ClearingRedeemFoundError"
import { CreateClearingRedeemDomainServiceRequest } from "./model/CreateClearingRedeemDomainServiceRequest"

@Singleton()
export class CreateClearingRedeemDomainService {
  constructor(
    @Inject("ClearingRedeemRepository")
    private readonly clearingRepository: ClearingRedeemRepository,
  ) {}

  async execute(request: CreateClearingRedeemDomainServiceRequest, transactionId?: string): Promise<ClearingRedeem> {
    const existingClearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (existingClearing) {
      throw new ClearingRedeemFoundError(request.clearingId)
    }
    const clearing = new ClearingRedeem()
    const date = new Date()
    clearing.id = request.clearingId
    clearing.bondContractId = request.bondContractId
    clearing.holderAccountId = request.holderAccountId
    clearing.partition = request.partition
    clearing.amount = request.amount
    clearing.expirationDate = request.expirationDate
    clearing.status = ClearingStatus.PENDING
    clearing.data = request.data
    clearing.operatorData = request.operatorData
    clearing.operatorAccountId = request.operator
    clearing.createdAt = date
    clearing.updatedAt = date

    return await this.clearingRepository.save(clearing, transactionId)
  }
}
