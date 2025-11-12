// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold, ClearingStatus } from "../model/ClearingHold"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"
import { ClearingFoundError } from "../errors/ClearingFoundError"
import { CreateClearingHoldDomainServiceRequest } from "./model/CreateClearingHoldDomainServiceRequest"

@Singleton()
export class CreateClearingHoldDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(request: CreateClearingHoldDomainServiceRequest): Promise<ClearingHold> {
    const existingClearing = await this.clearingRepository.findByClearingId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (existingClearing) {
      throw new ClearingFoundError(request.clearingId)
    }
    const clearing = new ClearingHold()
    clearing.bondContractId = request.bondContractId
    clearing.holderAccountId = request.holderAccountId
    clearing.clearingId = request.clearingId
    clearing.partition = request.partition
    clearing.amount = request.amount
    clearing.expirationDate = request.expirationDate
    clearing.status = ClearingStatus.PENDING
    clearing.toAddress = request.toAddress
    clearing.escrowAddress = request.escrowAddress
    clearing.data = request.data
    clearing.operatorData = request.operatorData
    clearing.operator = request.operator

    return await this.clearingRepository.save(clearing)
  }
}
