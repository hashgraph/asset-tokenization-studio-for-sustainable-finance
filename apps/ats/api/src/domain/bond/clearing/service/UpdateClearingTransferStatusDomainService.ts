// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"
import type { ClearingTransferRepository } from "../repository/ClearingTransferRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { UpdateClearingStatusDomainServiceRequest } from "./model/UpdateClearingStatusDomainServiceRequest"

@Singleton()
export class UpdateClearingTransferStatusDomainService {
  constructor(
    @Inject("ClearingTransferRepository")
    private readonly clearingRepository: ClearingTransferRepository,
  ) {}

  async execute(request: UpdateClearingStatusDomainServiceRequest): Promise<ClearingTransfer> {
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
