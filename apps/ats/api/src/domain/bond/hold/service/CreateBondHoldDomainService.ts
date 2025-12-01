// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { BondHoldRepository } from "../repository/BondHoldRepository"
import { BondHold } from "../model/BondHold"
import { BondHoldFoundError } from "../errors/BondHoldFoundError"
import { CreateBondHoldDomainServiceRequest } from "./model/CreateBondHoldDomainServiceRequest"

@Singleton()
export class CreateBondHoldDomainService {
  constructor(@Inject() private readonly bondHoldRepository: BondHoldRepository) {}

  async execute(request: CreateBondHoldDomainServiceRequest): Promise<BondHold> {
    const now = new Date()

    const existingHold = await this.bondHoldRepository.findByContractIdAndHolderAndHoldId(
      request.bondContractId,
      request.holderAccountId,
      request.holdId,
      request.partition,
    )

    if (existingHold) {
      throw BondHoldFoundError.holdIdError(request.bondContractId, request.holdId)
    }

    const bondHold = Object.assign(new BondHold(), {
      id: request.holdId,
      contractId: request.bondContractId,
      holderAccountId: request.holderAccountId,
      partition: request.partition,
      amount: request.amount,
      expirationTimestamp: request.expirationTimestamp,
      escrowAccountId: request.escrowAccountId,
      toAccountId: request.toAccountId,
      data: request.data,
      operatorData: request.operatorData,
      operatorAccountId: request.operatorAccountId,
      createdAt: now,
      updatedAt: now,
    })

    return await this.bondHoldRepository.save(bondHold)
  }
}
