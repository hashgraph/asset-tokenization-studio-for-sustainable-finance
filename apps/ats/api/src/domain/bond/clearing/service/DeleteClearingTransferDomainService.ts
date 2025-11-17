// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ClearingTransfer } from "../model/ClearingTransfer"
import type { ClearingTransferRepository } from "../repository/ClearingTransferRepository"
import { ClearingNotFoundError } from "../errors/ClearingNotFoundError"
import { DeleteClearingDomainServiceRequest } from "./model/DeleteClearingDomainServiceRequest"

@Singleton()
export class DeleteClearingTransferDomainService {
  constructor(
    @Inject("ClearingTransferRepository")
    private readonly clearingRepository: ClearingTransferRepository,
  ) {}

  async execute(request: DeleteClearingDomainServiceRequest): Promise<ClearingTransfer> {
    const clearing = await this.clearingRepository.findByContractIdHolderAccountIdAndId(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    if (!clearing) {
      throw new ClearingNotFoundError(`${request.bondContractId}/${request.holderAccountId}/${request.clearingId}`)
    }

    clearing.validateNotExpired()

    await this.clearingRepository.deleteByCompositeKey(
      request.bondContractId,
      request.holderAccountId,
      request.clearingId,
    )

    return clearing
  }
}
