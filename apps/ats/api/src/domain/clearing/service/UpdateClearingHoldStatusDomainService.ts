// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingHold } from "../model/ClearingHold"
import type { ClearingHoldRepository } from "../repository/ClearingHoldRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { UpdateClearingStatusDomainServiceRequest } from "./model/UpdateClearingStatusDomainServiceRequest"

@Singleton()
export class UpdateClearingHoldStatusDomainService {
  constructor(
    @Inject("ClearingHoldRepository")
    private readonly clearingRepository: ClearingHoldRepository,
  ) {}

  async execute(request: UpdateClearingStatusDomainServiceRequest, transactionId?: string): Promise<ClearingHold> {
    const clearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (!clearing) {
      throw new ClearingNotFoundError(`${request.bondContractId}/${request.holderAccountId}/${request.clearingId}`)
    }

    clearing.validateNotExpired()

    clearing.status = request.newStatus
    clearing.updatedAt = new Date()

    return await this.clearingRepository.update(clearing, transactionId)
  }
}
