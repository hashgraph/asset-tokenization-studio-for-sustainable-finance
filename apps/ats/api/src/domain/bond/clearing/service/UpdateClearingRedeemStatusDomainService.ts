// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingRedeem } from "../model/ClearingRedeem"
import type { ClearingRedeemRepository } from "../repository/ClearingRedeemRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { UpdateClearingStatusDomainServiceRequest } from "./model/UpdateClearingStatusDomainServiceRequest"

@Singleton()
export class UpdateClearingRedeemStatusDomainService {
  constructor(
    @Inject("ClearingRedeemRepository")
    private readonly clearingRepository: ClearingRedeemRepository,
  ) {}

  async execute(request: UpdateClearingStatusDomainServiceRequest): Promise<ClearingRedeem> {
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

    return await this.clearingRepository.update(clearing)
  }
}
